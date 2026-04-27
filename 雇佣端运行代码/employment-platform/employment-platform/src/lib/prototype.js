import { STATUS_META, TYPE_META, USERS } from '../mock/seed.js'

export function roleHome(role) {
  return role === 'lead' ? '/lead/templates' : '/staff/department'
}

export function isOwner(user, instance) {
  return Boolean(user && instance && user.id === instance.ownerUserId)
}

export function canAccessInstance(user, instance) {
  if (!user || !instance) return false

  if (instance.instanceType === 'department') {
    if (user.role === 'lead') return instance.departmentId === user.departmentId
    return instance.departmentId === user.departmentId && instance.status === 'live'
  }

  if (instance.instanceType === 'private_branch') {
    return isOwner(user, instance)
  }

  return isOwner(user, instance)
}

export function statusLabel(status) {
  return STATUS_META[status]?.label || status
}

export function typeLabel(type) {
  return TYPE_META[type]?.label || type
}

export function typeTone(type) {
  return TYPE_META[type]?.tone || 'slate'
}

export function findTemplate(templates, templateId) {
  return templates.find((template) => template.id === templateId)
}

export function findInstance(instances, id) {
  return instances.find((instance) => instance.id === id)
}

export function visibleDepartmentInstances(user, instances) {
  if (user.role === 'lead') {
    return instances.filter(
      (instance) =>
        instance.instanceType === 'department' &&
        instance.departmentId === user.departmentId &&
        instance.status !== 'retired'
    )
  }

  return instances.filter(
    (instance) =>
      instance.instanceType === 'department' &&
      instance.departmentId === user.departmentId &&
      instance.status === 'live'
  )
}

export function visibleMyInstances(user, instances) {
  return instances.filter(
    (instance) => instance.ownerUserId === user.id && instance.instanceType !== 'department'
  )
}

export function getLineage(instance, instances, templates) {
  if (!instance) return []

  const chain = []
  const template = findTemplate(templates, instance.templateId)
  if (template) {
    chain.push({
      kind: 'template',
      id: template.id,
      label: template.name,
      meta: template.sceneIntro
    })
  }

  const sourceStack = []
  let cursor = instance
  while (cursor) {
    sourceStack.unshift(cursor)
    cursor = cursor.sourceInstanceId ? findInstance(instances, cursor.sourceInstanceId) : null
  }

  sourceStack.forEach((item) => {
    chain.push({
      kind: item.instanceType,
      id: item.id,
      label: item.displayName,
      meta: statusLabel(item.status)
    })
  })

  return chain
}

export function tabLabelForLead(tab) {
  const labels = {
    hired: '已雇佣',
    interning_ai: 'AI 评估',
    interning_human: '人工评估',
    live: '已上岗'
  }
  return labels[tab] || tab
}

export function countByStatus(instances, status) {
  return instances.filter((instance) => instance.status === status).length
}

export function formatMetric(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString('zh-CN')
  return value
}

export function staffCanClone(user, instance) {
  return (
    user.role === 'staff' &&
    instance.instanceType === 'department' &&
    instance.status === 'live'
  )
}

export function leadCanCloneForSelf(user, instance) {
  return (
    user.role === 'lead' &&
    instance.instanceType === 'department' &&
    instance.status === 'live'
  )
}

export function canCreateBranch(user, instance) {
  return (
    user.id === instance.ownerUserId &&
    instance.instanceType === 'personal_clone' &&
    instance.status === 'live'
  )
}

export function defaultUserForRole(role) {
  return role === 'lead' ? USERS.lead : USERS.staff
}
