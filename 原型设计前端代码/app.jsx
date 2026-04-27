/* global window, React, ReactDOM */
const { useState: _useStateA, useEffect: _useEffectA } = React;

function App() {
  const [role, setRole] = _useStateA("manager");
  const [route, setRoute] = _useStateA("templates"); // hash-like
  const [toasts, setToasts] = _useStateA([]);
  const [larkOpen, setLarkOpen] = _useStateA(false);
  const [larkEmp, setLarkEmp] = _useStateA(null);

  function go(r) {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // when role changes, push to a sensible landing page
  _useEffectA(() => {
    if (role === "member" && (route.startsWith("templates") || route.startsWith("template/") || route.startsWith("hire"))) {
      setRoute("dept");
    }
  }, [role]);

  function toast(msg, kind = "success") {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2200);
  }

  function openLark(emp) { setLarkEmp(emp); setLarkOpen(true); }

  // route resolution
  let page = null;
  if (route === "templates") page = <window.TemplatesPage go={go}/>;
  else if (route === "dept") page = <window.DeptPage role={role} go={go}/>;
  else if (route === "my") page = <window.MyPage role={role} go={go}/>;
  else if (route.startsWith("template/")) page = <window.TemplateDetailPage id={route.split("/")[1]} go={go} role={role}/>;
  else if (route.startsWith("employee/")) page = <window.EmployeeDetailPage id={route.split("/")[1]} role={role} go={go} openLark={openLark}/>;
  else if (route.startsWith("hire/")) {
    const rest = route.split("/")[1];
    if (rest === "new") {
      const tplMatch = route.match(/tpl=([\w_]+)/);
      page = <window.HirePage tpl={tplMatch ? tplMatch[1] : null} go={go} toast={toast}/>;
    } else page = <window.HirePage id={rest} go={go} toast={toast}/>;
  }
  else if (route.startsWith("eval-ai/")) page = <window.AIEvalPage id={route.split("/")[1]} go={go} toast={toast}/>;
  else if (route.startsWith("eval-human/")) page = <window.HumanEvalPage id={route.split("/")[1]} go={go} toast={toast}/>;
  else if (route.startsWith("review/")) page = <window.ReviewPage id={route.split("/")[1]} go={go} toast={toast}/>;
  else if (route.startsWith("onboard/")) page = <window.OnboardPage id={route.split("/")[1]} go={go} toast={toast}/>;
  else if (route.startsWith("clone/")) page = <window.ClonePage id={route.split("/")[1]} go={go} toast={toast}/>;
  else if (route.startsWith("branch/")) page = <window.BranchPage id={route.split("/")[1]} go={go} toast={toast}/>;
  else page = <window.TemplatesPage go={go}/>;

  return (
    <div className="app">
      <window.TopNav role={role} setRole={setRole} route={route} go={go}/>
      {page}
      <window.LarkGuideModal open={larkOpen} onClose={() => setLarkOpen(false)} employee={larkEmp}/>
      <window.ToastHost toasts={toasts}/>
      <div className="feedback-strip">📝 演示模式 · 顶部可切换角色</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
