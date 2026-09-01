import styles from './EvaluationMatrix.module.css';

const SCORE_HEADERS = [
  ['业务表现', '25%'],
  ['商务条件', '25%'],
  ['空间效率', '15%'],
  ['变更成本', '15%'],
  ['资本投入', '10%'],
  ['办公适配度', '10%'],
] as const;

const SITE_EVALUATIONS = [
  ['Site A', 5, 2, 2, 5, 5, 5, '整体条件较强，但现有模式存在优化空间', '高业务价值 · 租金偏高 · 空间效率偏低', 'Restructure'],
  ['Site B', 5, 3, 2, 5, 5, 5, '整体稳定，调整必要性较低', '高业务价值 · 刚续租 · 租赁条件合理', 'Remain'],
  ['Site C', 5, 5, 3, 3, 3, 3, '现状条件较优，同时存在灵活化可能', '高业务价值 · 租金较低 · Flex 存在一定节省空间', 'Remain / Flex Office'],
  ['Site D', 5, 2, 3, 3, 3, 1, '当前模式存在较明显调整需求', '租金偏高 · 传统办公适配度较低', 'Restructure / Flex Office'],
  ['Site E', 2, 2, 3, 1, 3, 1, '传统办公继续维持的吸引力较低', '租金偏高 · 调整约束较低 · Flex 节省潜力较高', 'Flex Office / Restructure'],
  ['Site F', 3, 3, 3, 5, 3, 3, '当前条件尚可，短期维持具有合理性', '租赁条件较好 · 刚续租 · 调整成本较高', 'Remain / Flex Office'],
  ['Site G', 3, 2, 3, 5, 3, 3, '现状存在优化空间，但调整受到一定约束', '租金偏高 · 调整成本较高 · Flex 具备潜在机会', 'Restructure / Flex Office'],
  ['Site H', 3, 3, 2, 3, 3, 1, '当前空间模式与需求适配度较弱', '空间效率偏低 · Flex 节省潜力较高', 'Restructure / Flex Office'],
  ['Site I', 3, 3, 2, 1, 2, 5, '综合条件一般，但替代办公方案有限', 'Flex 选择较少 · 传统办公适配度较高', 'Remain'],
] as const;

export default function EvaluationMatrix() {
  return (
    <section className={styles.matrixCard} aria-labelledby="evaluation-matrix-title">
      <h4 id="evaluation-matrix-title" className="srOnly">办公点位评价矩阵</h4>
      <div className={styles.scrollFrame} tabIndex={0} aria-label="可横向滚动查看完整评价矩阵">
        <table className={styles.matrixTable}>
          <caption className="srOnly">Site A 至 Site I 的六项评分、综合判断、关键条件组合与推荐方向</caption>
          <thead>
            <tr>
              <th scope="col">Site</th>
              {SCORE_HEADERS.map(([label, weight]) => (
                <th scope="col" key={label}>
                  <span>{label}</span>
                  <small>({weight})</small>
                </th>
              ))}
              <th scope="col">综合判断</th>
              <th scope="col">关键条件组合</th>
              <th scope="col" className={styles.directionHeader}>Recommended<br />Direction</th>
            </tr>
          </thead>
          <tbody>
            {SITE_EVALUATIONS.map(([site, ...values]) => {
              const scores = values.slice(0, 6) as readonly number[];
              const [summary, conditions, direction] = values.slice(6) as readonly string[];
              return (
                <tr key={site}>
                  <th scope="row">{site}</th>
                  {scores.map((score, index) => <td className={styles.score} key={`${site}-${index}`}>{score}</td>)}
                  <td className={styles.copyCell}>{summary}</td>
                  <td className={styles.copyCell}>{conditions}</td>
                  <td className={styles.direction}>
                    {direction.split(' / ').map((item) => <span key={item}>{item}</span>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <footer className={styles.legend}>
        <div className={styles.scaleGroup}>
          <strong>Scoring Scale</strong>
          <span><b>5</b> 明显特征</span>
          <span><b>3</b> 中等特征</span>
          <span><b>2</b> 较弱特征</span>
          <span><b>1</b> 弱特征</span>
        </div>
        <p>各 Site 按统一规则落入对应评分档位；分值用于编码条件差异，并不代表统一意义上的“优 / 劣”。</p>
      </footer>
    </section>
  );
}
