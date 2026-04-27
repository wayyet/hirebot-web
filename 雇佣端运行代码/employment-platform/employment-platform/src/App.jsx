import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell.jsx'
import { roleHome } from './lib/prototype.js'
import { useApp } from './store.jsx'
import TemplatePool from './pages/lead/TemplatePool.jsx'
import TemplateDetail from './pages/lead/TemplateDetail.jsx'
import HireWizard from './pages/lead/HireWizard.jsx'
import CloneFlow from './pages/staff/CloneFlow.jsx'
import PrivateBranch from './pages/staff/PrivateBranch.jsx'
import DepartmentEmployees from './pages/shared/DepartmentEmployees.jsx'
import MyEmployees from './pages/shared/MyEmployees.jsx'
import EmployeeDetail from './pages/shared/EmployeeDetail.jsx'
import AiEvaluation from './pages/shared/AiEvaluation.jsx'
import HumanEvaluation from './pages/shared/HumanEvaluation.jsx'
import ReviewCenter from './pages/shared/ReviewCenter.jsx'
import IdentityLaunch from './pages/shared/IdentityLaunch.jsx'

function HomeRedirect() {
  const { user } = useApp()
  return <Navigate to={roleHome(user.role)} replace />
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/lead/templates" element={<TemplatePool />} />
        <Route path="/lead/department" element={<DepartmentEmployees />} />
        <Route path="/lead/mine" element={<MyEmployees />} />
        <Route path="/staff/department" element={<DepartmentEmployees />} />
        <Route path="/staff/mine" element={<MyEmployees />} />

        <Route path="/templates/:id" element={<TemplateDetail />} />
        <Route path="/instances/:id" element={<EmployeeDetail />} />
        <Route path="/hire/:draftId" element={<HireWizard />} />
        <Route path="/ai-evaluation/:id" element={<AiEvaluation />} />
        <Route path="/human-evaluation/:id" element={<HumanEvaluation />} />
        <Route path="/review/:id" element={<ReviewCenter />} />
        <Route path="/identity/:id" element={<IdentityLaunch />} />
        <Route path="/clone/:instanceId" element={<CloneFlow />} />
        <Route path="/branch/:instanceId" element={<PrivateBranch />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Shell>
  )
}
