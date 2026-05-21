'use client';

import { Button } from '@tongqian/ui';
import { useRef } from 'react';

export function FileUploadButton({ onPicked }: { onPicked: (summary: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onPicked(`已上传 ${file.name}，请直接按合同/招标/图纸类型做初审。文件大小 ${(file.size / 1024 / 1024).toFixed(2)}MB。`);
          event.target.value = '';
        }}
        type="file"
      />
      <Button onClick={() => inputRef.current?.click()} type="button" variant="outline">
        上传文件直接审
      </Button>
    </>
  );
}
