import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { roleHome } from '../lib/prototype.js'
import { useApp } from '../store.jsx'
import { Card, cx, Pill, SquircleAvatar } from './UI.jsx'

const NAV = {
  lead: [
    { to: '/lead/templates', label: '企业模板池', hint: '从模板发起部门版雇佣' },
    { to: '/lead/department', label: '部门数字员工', hint: '按状态管理部门员工' },
    { to: '/lead/mine', label: '我的数字员工', hint: '仅看我拥有的分身与私定版' }
  ],
  staff: [
    { to: '/staff/department', label: '部门数字员工', hint: '只看本部门已上岗母版' },
    { to: '/staff/mine', label: '我的数字员工', hint: '管理自己的分身与私人定制' }
  ]
}

export default function Shell({ children }) {
  const { user, switchRole } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = NAV[user.role]

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fff0e0_0%,#fde9eb_48%,#e1e9fa_100%)] text-[#0a0a0a]">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Card className="flex-1 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-black text-base font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                  雇
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
                    雇佣端交互原型
                    <Pill tone="blue">V12 对齐</Pill>
                  </div>
                  <div className="mt-1 text-sm text-[#6f6f78]">
                    Web 负责雇佣、评估、配置与管理；正式使用统一收敛到飞书一对一私聊。
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-[#ececec] bg-white px-2 py-1 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                  <button
                    onClick={() => {
                      switchRole('lead')
                      navigate(roleHome('lead'))
                    }}
                    className={cx(
                      'rounded-full px-4 py-2 text-sm transition',
                      user.role === 'lead' ? 'bg-black text-white' : 'text-[#666] hover:text-[#0a0a0a]'
                    )}
                  >
                    部门长 · 张明
                  </button>
                  <button
                    onClick={() => {
                      switchRole('staff')
                      navigate(roleHome('staff'))
                    }}
                    className={cx(
                      'rounded-full px-4 py-2 text-sm transition',
                      user.role === 'staff' ? 'bg-black text-white' : 'text-[#666] hover:text-[#0a0a0a]'
                    )}
                  >
                    普通成员 · 王小芳
                  </button>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-[#ececec] bg-white px-3 py-2 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                  <SquircleAvatar initial={user.name[0]} tone={user.role === 'lead' ? 'blue' : 'emerald'} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-[#0a0a0a]">{user.name}</div>
                    <div className="text-xs text-[#8b8b92]">{user.department} · {user.roleLabel}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </header>

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Card className="px-4 py-4">
              <div className="text-xs text-[#8b8b92]">当前模块导航</div>
              <nav className="mt-4 space-y-2">
                {navItems.map((item) => {
                  const active = location.pathname === item.to
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={cx(
                        'block rounded-[22px] border px-4 py-3 transition',
                        active
                          ? 'border-black bg-black text-white shadow-[0_10px_26px_rgba(0,0,0,0.12)]'
                          : 'border-[#ececec] bg-white text-[#0a0a0a] hover:border-[#d4d4d8] hover:bg-[#fafafa]'
                      )}
                    >
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className={cx('mt-1 text-xs leading-6', active ? 'text-white/75' : 'text-[#8b8b92]')}>
                        {item.hint}
                      </div>
                    </NavLink>
                  )
                })}
              </nav>
            </Card>

            <Card className="px-4 py-4">
              <div className="text-sm font-semibold text-[#0a0a0a]">评审提示</div>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#6f6f78]">
                <p>1. “部门数字员工”模块按角色展示不同状态范围，但名称保持统一。</p>
                <p>2. 详情页承担动作分发，列表页统一只负责进入详情。</p>
                <p>3. Web 不再承接正式聊天，主动作会引导到飞书并保留调试预览。</p>
              </div>
            </Card>
          </aside>

          <main className="space-y-4">{children}</main>
        </div>
      </div>
    </div>
  )
}
