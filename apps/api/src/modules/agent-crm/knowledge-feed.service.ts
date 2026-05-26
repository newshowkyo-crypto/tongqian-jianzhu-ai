const categories = ['qual_policy', 'bid_rules', 'financing_window', 'industry_news', 'best_practice'];

export class AgentKnowledgeFeedService {
  list(): Array<{ category: string; isNew: boolean; title: string }> {
    return categories.map((category) => ({ category, isNew: true, title: `${category} knowledge` }));
  }
}
