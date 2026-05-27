// App — arranges all four wireframe directions in a design canvas.

const SCREEN_W = 1280;
const SCREEN_H = 820;

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="d1"
        title="01 / LEDGER"
        subtitle="双栏 · 时间线过程 · 编辑型大字 · 黑白+信号红">
        <DCArtboard id="d1-home" label="A · Home  任务输入" width={SCREEN_W} height={SCREEN_H}>
          <D1Home/>
        </DCArtboard>
        <DCArtboard id="d1-run" label="B · Running  运行轨迹" width={SCREEN_W} height={SCREEN_H}>
          <D1Running/>
        </DCArtboard>
        <DCArtboard id="d1-report" label="C · Report  报告查看" width={SCREEN_W} height={SCREEN_H}>
          <D1Report/>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="d2"
        title="02 / ESSAY"
        subtitle="单栏长文 · 报告即编辑物 · 巨号 display · 文档内联过程">
        <DCArtboard id="d2-home" label="A · Home  封面提问" width={SCREEN_W} height={SCREEN_H}>
          <D2Home/>
        </DCArtboard>
        <DCArtboard id="d2-run" label="B · Running  边写边注" width={SCREEN_W} height={SCREEN_H}>
          <D2Running/>
        </DCArtboard>
        <DCArtboard id="d2-report" label="C · Report  长文与脚注" width={SCREEN_W} height={SCREEN_H}>
          <D2Report/>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="d3"
        title="03 / WORKBENCH"
        subtitle="三栏 · 节点图流程 · 工程紧凑 · 高密度">
        <DCArtboard id="d3-home" label="A · Home  工作台" width={SCREEN_W} height={SCREEN_H}>
          <D3Home/>
        </DCArtboard>
        <DCArtboard id="d3-run" label="B · Running  节点图" width={SCREEN_W} height={SCREEN_H}>
          <D3Running/>
        </DCArtboard>
        <DCArtboard id="d3-report" label="C · Report  报告+流程" width={SCREEN_W} height={SCREEN_H}>
          <D3Report/>
        </DCArtboard>
      </DCSection>

      <DCSection
        id="d4"
        title="04 / STACK"
        subtitle="单栏 · 顶部 tab 切换 · 大卡片堆叠过程 · 中性几何">
        <DCArtboard id="d4-home" label="A · Home  CHAT tab" width={SCREEN_W} height={SCREEN_H}>
          <D4Home/>
        </DCArtboard>
        <DCArtboard id="d4-run" label="B · Running  PROCESS tab" width={SCREEN_W} height={SCREEN_H}>
          <D4Running/>
        </DCArtboard>
        <DCArtboard id="d4-report" label="C · Report  REPORT tab" width={SCREEN_W} height={SCREEN_H}>
          <D4Report/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
