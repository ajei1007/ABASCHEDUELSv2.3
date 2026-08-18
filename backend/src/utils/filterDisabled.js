const filterDisabled = (payload) => {
  const payload_new = payload.rows.filter(e => !e.disabled);
  payload = { rows: payload_new, count: payload_new.length };
  return payload
}

module.exports = filterDisabled;