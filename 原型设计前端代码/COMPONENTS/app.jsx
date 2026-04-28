/* global window, React, ReactDOM */
const { useState: _useStateA, useEffect: _useEffectA } = React;

function App() {
  const [role, setRole] = _useStateA("manager");
  const [route, setRoute] = _useStateA("templates");
  const [toasts, setToasts] = _useStateA([]);

  function go(nextRoute) {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  _useEffectA(() => {
    if (role === "member" && (
      route.startsWith("templates") ||
      route.startsWith("template/") ||
      route.startsWith("hire/new") ||
      route.startsWith("quick-clone/")
    )) {
      setRoute("dept");
    }
  }, [role, route]);

  function toast(msg, kind = "success") {
    const id = Math.random().toString(36).slice(2);
    setToasts(items => [...items, { id, msg, kind }]);
    setTimeout(() => setToasts(items => items.filter(item => item.id !== id)), 2200);
  }

  let page = null;

  if (route === "templates") page = <window.TemplatesPage go={go} />;
  else if (route === "dept") page = <window.DeptPage role={role} go={go} />;
  else if (route === "my") page = <window.MyPage role={role} go={go} />;
  else if (route.startsWith("template/")) page = <window.TemplateDetailPage id={route.split("/")[1]} go={go} role={role} />;
  else if (route.startsWith("employee/")) page = <window.EmployeeDetailPage id={route.split("/")[1]} role={role} go={go} toast={toast} />;
  else if (route.startsWith("hire/")) {
    const rest = route.split("/")[1];
    if (route.startsWith("hire/new")) {
      const tplMatch = route.match(/tpl=([\w_]+)/);
      page = <window.HirePage tpl={tplMatch ? tplMatch[1] : null} go={go} toast={toast} />;
    } else {
      const cleanId = rest.split("?")[0];
      page = <window.HirePage id={cleanId} go={go} toast={toast} />;
    }
  } else if (route.startsWith("eval-ai/")) page = <window.AIEvalPage id={route.split("/")[1]} go={go} toast={toast} />;
  else if (route.startsWith("eval-human/")) page = <window.HumanEvalPage id={route.split("/")[1]} go={go} toast={toast} />;
  else if (route.startsWith("review/")) page = <window.ReviewPage id={route.split("/")[1]} go={go} toast={toast} />;
  else if (route.startsWith("publish/")) page = <window.PublishPage id={route.split("/")[1]} role={role} go={go} toast={toast} />;
  else if (route.startsWith("im/")) page = <window.IMConfigPage id={route.split("/")[1]} go={go} toast={toast} />;
  else if (route.startsWith("chat/")) page = <window.ChatPage id={route.split("/")[1]} role={role} go={go} toast={toast} />;
  else if (route.startsWith("clone/")) page = <window.ClonePage id={route.split("/")[1]} role={role} go={go} toast={toast} />;
  else if (route.startsWith("quick-clone/")) page = <window.QuickClonePage id={route.split("/")[1]} go={go} toast={toast} />;
  else if (route.startsWith("branch/")) page = <window.BranchPage id={route.split("/")[1]} role={role} go={go} toast={toast} />;
  else page = <window.TemplatesPage go={go} />;

  return (
    <div className="app">
      <window.TopNav role={role} setRole={setRole} route={route} go={go} />
      {page}
      <window.ToastHost toasts={toasts} />
      <div className="feedback-strip">原型模式 · 顶部可切换角色并点通关键流程</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
