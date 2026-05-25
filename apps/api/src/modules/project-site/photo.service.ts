import { Injectable } from '@nestjs/common';

interface SitePhotoRecord {
  aiSummary: string;
  aiTags: string[];
  category: 'document' | 'material' | 'progress' | 'quality' | 'safety';
  constructionLog: string;
  defectFound: boolean;
  defectLevel: 'high' | 'low' | 'medium' | 'none';
  id: string;
  ossUrl: string;
  projectId: string;
  uploadedAt: string;
  uploadedBy: string;
}

const photoStore: SitePhotoRecord[] = [];

@Injectable()
export class PhotoService {
  uploadAndClassify(input: { ossUrl: string; projectId: string; remark?: string; uploadedBy: string }): SitePhotoRecord {
    const defectFound = /临边|洞口|积水|裂缝|裸土|未戴/u.test(input.remark ?? '');
    const category = defectFound ? 'safety' : 'progress';
    const record: SitePhotoRecord = {
      aiSummary: defectFound ? '现场照片疑似存在安全或质量隐患，建议立即复核并形成整改闭环。' : '现场照片可归档为进度佐证，建议写入当日施工日志。',
      aiTags: defectFound ? ['隐患初筛', '整改闭环', '人工复核'] : ['进度照片', '施工日志', '形象进度'],
      category,
      constructionLog: `${new Date().toISOString().slice(0, 10)} ${input.remark ?? '上传现场照片'}，AI 已完成轻量分类。`,
      defectFound,
      defectLevel: defectFound ? 'medium' : 'none',
      id: crypto.randomUUID(),
      ossUrl: input.ossUrl,
      projectId: input.projectId,
      uploadedAt: new Date().toISOString(),
      uploadedBy: input.uploadedBy,
    };
    photoStore.push(record);
    return record;
  }

  list(projectId: string): SitePhotoRecord[] {
    return photoStore.filter((photo) => photo.projectId === projectId);
  }

  dailyPhotoSummary(projectId: string, date = new Date().toISOString().slice(0, 10)): { date: string; defectCount: number; photos: number; projectId: string; summary: string } {
    const photos = this.list(projectId).filter((photo) => photo.uploadedAt.startsWith(date));
    const defectCount = photos.filter((photo) => photo.defectFound).length;
    return {
      date,
      defectCount,
      photos: photos.length,
      projectId,
      summary: `今日归档 ${photos.length} 张现场照片，AI 初筛隐患 ${defectCount} 条。`,
    };
  }
}
