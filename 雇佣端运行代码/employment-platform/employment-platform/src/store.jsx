import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  createAiEvaluation,
  createBranchPlan,
  createDepartmentWorkflow,
  createHumanEvaluation,
  HIRE_STEPS,
  seedInstances,
  seedTemplates,
  USERS
} from './mock/seed.js'
import { findInstance, findTemplate } from './lib/prototype.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

let uidCounter = 200
function nextId(prefix) {
  uidCounter += 1
  return `${prefix}_${uidCounter}`
}

function branchDisplayName(sourceName) {
  if (sourceName.includes('我的')) return `${sourceName} · 私定版`
  return `${sourceName} · 私定版`
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(USERS.lead)
  const [templates] = useState(seedTemplates)
  const [instances, setInstances] = useState(seedInstances)
  const [toast, setToast] = useState(null)

  const switchRole = useCallback((role) => {
    setUser(role === 'lead' ? USERS.lead : USERS.staff)
  }, [])

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(window.__prototypeToastTimer)
    window.__prototypeToastTimer = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const updateInstance = useCallback((id, updater) => {
    setInstances((prev) =>
      prev.map((instance) => {
        if (instance.id !== id) return instance
        if (typeof updater === 'function') return updater(instance)
        return { ...instance, ...updater }
      })
    )
  }, [])

  const addInstance = useCallback((instance) => {
    setInstances((prev) => [instance, ...prev])
  }, [])

  const retireInstance = useCallback((id) => {
    setInstances((prev) =>
      prev.map((instance) =>
        instance.id === id
          ? {
              ...instance,
              status: 'retired',
              updatedAt: '刚刚',
              recentActive: '已退役',
              feishu: {
                ...instance.feishu,
                botStatus: '已退役'
              }
            }
          : instance
      )
    )
  }, [])

  const createDepartmentDraft = useCallback(
    ({ templateId, sourceInstanceId = null }) => {
      const template = findTemplate(templates, templateId)
      const source = sourceInstanceId ? findInstance(instances, sourceInstanceId) : null
      if (!template) return null

      const draftId = nextId('dept_draft')
      const displayName = source ? `${source.displayName} · 新一轮雇佣` : `${template.name} · ${user.department}版`
      const draft = {
        id: draftId,
        tenantId: user.tenantId,
        instanceType: 'department',
        status: 'hired',
        templateId: template.id,
        sourceInstanceId,
        ownerUserId: USERS.lead.id,
        ownerName: USERS.lead.name,
        departmentId: USERS.lead.departmentId,
        departmentName: USERS.lead.department,
        displayName,
        avatarInitial: source?.avatarInitial || `${template.icon}${user.name[0]}`,
        avatarTone: source?.avatarTone || template.tone,
        summary: source
          ? `基于「${source.displayName}」复制出新一轮雇佣草稿，用于继续优化部门版。`
          : `基于「${template.name}」模板发起新的部门版雇佣。`,
        abilityTags: [...template.capabilityTags.slice(0, 4)],
        updatedAt: '刚刚',
        recentActive: '刚刚保存',
        taskCount: 0,
        lastError: '无',
        cloneCount: 0,
        avgRating: null,
        currentStep: 0,
        feishu: {
          displayName: source?.feishu?.displayName || displayName,
          avatarInitial: source?.feishu?.avatarInitial || `${template.icon}${user.name[0]}`,
          description: source?.feishu?.description || template.sceneIntro,
          handle: '@pending_department',
          botStatus: '待配置'
        },
        latestEvaluation: {
          aiScore: null,
          humanScore: null,
          highlight: '草稿已创建，等待六步确认完成。'
        },
        workflow: createDepartmentWorkflow(template, USERS.lead.department, source?.displayName || ''),
        aiEvaluation: createAiEvaluation('running'),
        humanEvaluation: createHumanEvaluation('department'),
        debugPreview: []
      }

      setInstances((prev) => [draft, ...prev])
      return draftId
    },
    [instances, templates, user]
  )

  const createPrivateBranchDraft = useCallback(
    (sourceInstanceId) => {
      const source = findInstance(instances, sourceInstanceId)
      if (!source || source.instanceType === 'private_branch') return null

      const draftId = nextId('branch_draft')
      const draft = {
        id: draftId,
        tenantId: user.tenantId,
        instanceType: 'private_branch',
        status: 'hired',
        templateId: source.templateId,
        sourceInstanceId: source.id,
        ownerUserId: user.id,
        ownerName: user.name,
        departmentId: user.departmentId,
        departmentName: user.department,
        displayName: branchDisplayName(source.displayName),
        avatarInitial: '私定',
        avatarTone: 'purple',
        summary: `基于「${source.displayName}」的私人定制草稿，仅 ${user.name} 可见。`,
        abilityTags: [...source.abilityTags.slice(0, 3)],
        updatedAt: '刚刚',
        recentActive: '刚刚创建',
        taskCount: 0,
        lastError: '无',
        cloneCount: 0,
        avgRating: null,
        currentStep: 0,
        feishu: {
          ...source.feishu,
          botStatus: '待评估'
        },
        latestEvaluation: {
          aiScore: null,
          humanScore: null,
          highlight: '先说明差异目标，再进入 AI 评估。'
        },
        branchPlan: createBranchPlan(source.displayName),
        aiEvaluation: createAiEvaluation('running'),
        humanEvaluation: createHumanEvaluation('branch'),
        debugPreview: []
      }

      setInstances((prev) => [draft, ...prev])
      return draftId
    },
    [instances, user]
  )

  const createPersonalClone = useCallback(
    ({ sourceInstanceId, displayName, avatarInitial, description }) => {
      const source = findInstance(instances, sourceInstanceId)
      if (!source) return null

      const clone = {
        id: nextId('clone'),
        tenantId: user.tenantId,
        instanceType: 'personal_clone',
        status: 'live',
        templateId: source.templateId,
        sourceInstanceId: source.id,
        ownerUserId: user.id,
        ownerName: user.name,
        departmentId: user.departmentId,
        departmentName: user.department,
        displayName,
        avatarInitial,
        avatarTone: source.avatarTone,
        summary: `来自「${source.displayName}」的个人分身，复制后独立使用。`,
        abilityTags: [...source.abilityTags],
        updatedAt: '刚刚',
        recentActive: '刚刚上岗',
        taskCount: 0,
        lastError: '无',
        cloneCount: 0,
        avgRating: 5,
        currentStep: 0,
        feishu: {
          displayName,
          avatarInitial,
          description,
          handle: `@clone_${user.id}_${Math.random().toString(36).slice(2, 6)}`,
          botStatus: '已上线'
        },
        latestEvaluation: {
          aiScore: null,
          humanScore: null,
          highlight: '复制链路完成，无需经过双阶段评估。'
        },
        aiEvaluation: null,
        humanEvaluation: null,
        debugPreview: []
      }

      setInstances((prev) =>
        prev.map((instance) =>
          instance.id === source.id
            ? { ...instance, cloneCount: (instance.cloneCount || 0) + 1, updatedAt: '刚刚被复制' }
            : instance
        )
      )
      setInstances((prev) => [clone, ...prev])
      return clone
    },
    [instances, user]
  )

  const completeDepartmentIdentity = useCallback((id, identity) => {
    updateInstance(id, (instance) => ({
      ...instance,
      status: 'live',
      updatedAt: '刚刚',
      recentActive: '等待首条消息',
      avgRating: instance.avgRating || 4.6,
      feishu: {
        displayName: identity.displayName,
        avatarInitial: identity.avatarInitial,
        description: identity.description,
        handle: identity.handle,
        botStatus: '已上线'
      },
      latestEvaluation: {
        aiScore: instance.aiEvaluation?.score || 84,
        humanScore: 4.6,
        highlight: '已完成飞书身份配置，等待团队复制和使用。'
      }
    }))
  }, [updateInstance])

  const completePrivateBranchLaunch = useCallback((id) => {
    updateInstance(id, (instance) => ({
      ...instance,
      status: 'live',
      updatedAt: '刚刚',
      recentActive: '路由已切换',
      avgRating: 4.9,
      feishu: {
        ...instance.feishu,
        botStatus: '路由已切换'
      },
      latestEvaluation: {
        aiScore: instance.aiEvaluation?.score || 82,
        humanScore: 4.7,
        highlight: '已切换到底层私人定制路由，原分身联系人不变。'
      }
    }))
  }, [updateInstance])

  const value = useMemo(
    () => ({
      user,
      templates,
      instances,
      switchRole,
      showToast,
      updateInstance,
      addInstance,
      retireInstance,
      createDepartmentDraft,
      createPrivateBranchDraft,
      createPersonalClone,
      completeDepartmentIdentity,
      completePrivateBranchLaunch
    }),
    [
      addInstance,
      completeDepartmentIdentity,
      completePrivateBranchLaunch,
      createDepartmentDraft,
      createPersonalClone,
      createPrivateBranchDraft,
      instances,
      retireInstance,
      showToast,
      switchRole,
      templates,
      updateInstance,
      user
    ]
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-black px-5 py-2 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
          {toast}
        </div>
      )}
    </Ctx.Provider>
  )
}
