const types = ['AGENT_QUAL', 'AGENT_TENDER', 'AGENT_FIN'];

export const agentOpportunitySources = types.flatMap((agentSubtype) =>
  Array.from({ length: 5 }, (_, index) => ({
    agentSubtype,
    code: `${agentSubtype}-${index + 1}`,
    name: `${agentSubtype} source ${index + 1}`,
    region: 'CN',
    sourceUrl: 'https://example.cn/source',
  })),
);
