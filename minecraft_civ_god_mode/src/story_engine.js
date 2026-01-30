function classifyEvent(evt) {
  const t = (evt.type || '').toUpperCase()
  if (t.includes('WAR') || t.includes('BATTLE')) return 'WAR'
  if (t.includes('FAMINE') || t.includes('PLAGUE')) return 'DISASTER'
  if (t.includes('CITY') || t.includes('FOUNDED')) return 'BUILD'
  if (t.includes('KING') || t.includes('CROWN')) return 'POLITICS'
  if (t.includes('VILLAIN') || t.includes('TENSION')) return 'THREAT'
  return 'MISC'
}
function shotPlanFor(evt) {
  const kind = classifyEvent(evt)
  switch (kind) {
    case 'BUILD': return [['WIDE_ORBIT', 6], ['LOW_DOLLY_IN', 4]]
    case 'WAR': return [['CRANE_DOWN', 5], ['FOLLOW', 6], ['SHAKE_ZOOM', 3]]
    case 'DISASTER': return [['WIDE_STATIC', 4], ['SLOW_PAN', 6]]
    case 'THREAT': return [['DARK_ORBIT', 5], ['PUSH_IN', 4]]
    default: return [['WIDE_ORBIT', 5]]
  }
}
function hookLine(evt) {
  const t = evt.description || evt.type || 'EVENT'
  return String(t).slice(0, 120)
}
module.exports = { classifyEvent, shotPlanFor, hookLine }
