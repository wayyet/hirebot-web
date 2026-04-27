import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { findInstance } from '../../lib/prototype.js'
import { useApp } from '../../store.jsx'
import { Card, PageHero, PrimaryButton, SecondaryButton, SquircleAvatar } from '../../components/UI.jsx'

const STEPS = ['bot 注册', '身份写入', '运行时启动', '状态切换']

export default function IdentityLaunch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { instances, completeDepartmentIdentity, showToast } = useApp()
  const instance = findInstance(instances, id)
  const [form, setForm] = useState({
    displayName: instance?.feishu?.displayName || instance?.displayName || '',
    avatarInitial: instance?.feishu?.avatarInitial || instance?.avatarInitial || '',
    description: instance?.feishu?.description || instance?.summary || ''
  })
  const [launching, setLaunching] = useState(false)
  const [progressIndex, setProgressIndex] = useState(-1)

  useEffect(() => {
    if (!launching || !instance) return undefined

    if (progressIndex >= STEPS.length) {
      const handle = `@${instance.id.slice(0, 10)}`
      completeDepartmentIdentity(instance.id, {
        displayName: form.displayName.trim(),
        avatarInitial: form.avatarInitial.trim(),
        description: form.description.trim(),
        handle
      })
      showToast('飞书身份配置完成，已切到 live')
      navigate(`/instances/${instance.id}`)
      return undefined
    }

    const timer = window.setTimeout(() => {
      setProgressIndex((current) => current + 1)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [completeDepartmentIdentity, form, instance, launching, navigate, progressIndex, showToast])

  if (!instance) {
    return (
      <Card>
        <div className="text-center text-sm text-[#6f6f78]">当前实例不存在，无法配置飞书身份。</div>
      </Card>
    )
  }

  function startLaunch() {
    if (!form.displayName.trim()) {
      showToast('display_name 必填')
      return
    }
    setLaunching(true)
    setProgressIndex(0)
  }

  return (
    <div className="space-y-4">
      <PageHero
        eyebrow="飞书身份配置与上岗"
        title={`配置「${instance.displayName}」的飞书身份`}
        subtitle="这一步决定数字员工在飞书里“看起来是谁”。修改 display_name、头像和描述不会触发重新评估，但只有配置完成后才会正式上岗。"
        actions={
          <>
            <SecondaryButton onClick={() => navigate(`/instances/${instance.id}`)}>返回详情</SecondaryButton>
            <PrimaryButton onClick={startLaunch}>确认配置并上岗</PrimaryButton>
          </>
        }
        stats={[
          { label: '上岗对象', value: instance.displayName },
          { label: '当前阶段', value: launching ? STEPS[Math.min(progressIndex, STEPS.length - 1)] : '待配置' },
          { label: '关键校验', value: 'display_name 必填', hint: '同 owner 下需唯一' }
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-[#0a0a0a]">表单区</div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-[#0a0a0a]">display_name</div>
              <input
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                className="w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-[#0a0a0a]">display_avatar</div>
              <input
                value={form.avatarInitial}
                onChange={(event) =>
                  setForm((current) => ({ ...current, avatarInitial: event.target.value.slice(0, 4) }))
                }
                className="w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-[#0a0a0a]">display_description</div>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="w-full rounded-[18px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#4a6cf7] focus:ring-4 focus:ring-[#dde5ff]"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[#0a0a0a]">飞书预览区</div>
            <div className="rounded-[28px] border border-[#ececec] bg-[#fafafa] p-5">
              <div className="rounded-[24px] border border-[#ececec] bg-white p-5 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <SquircleAvatar initial={form.avatarInitial || '待配'} tone={instance.avatarTone} size="xl" />
                <div className="mt-4 text-lg font-semibold text-[#0a0a0a]">{form.displayName || '未命名'}</div>
                <div className="mt-2 text-sm text-[#6f6f78]">{form.description || '暂无描述'}</div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="text-lg font-semibold text-[#0a0a0a]">上岗进度区</div>
            <div className="space-y-3">
              {STEPS.map((step, index) => {
                const done = launching && index < progressIndex
                const active = launching && index === progressIndex
                return (
                  <div key={step} className="rounded-[20px] bg-[#fafafa] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-[#0a0a0a]">{step}</div>
                      <div className="text-xs text-[#8b8b92]">
                        {done ? '已完成' : active ? '执行中' : '待执行'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
