const RolesDBApi = require('../db/api/roles');

const get_role_hierarchy = (roles) => {
  role_obj = {}
    roles.rows.map(e => {
      let roles_all = []
      
      let parent_id = e.parent ? e.parent.name : null
      let i = 0
      while(parent_id && parent_id != null && i < 1000){
        roles_all.push(parent_id)
        const role_parent = roles.rows.find(r => r.name == parent_id)?.parent || null
        parent_id = role_parent != null ? role_parent.name : null
        i++
      }
      role_obj[e.name] = roles_all

    })
    return role_obj
}

const getRolesByGroupName = async (req, name) => {
  const roles = await RolesDBApi.findAll({ companyId: req.currentUser.companyId });
  const role_obj = get_role_hierarchy(roles)
  
  let payload = await RolesDBApi.findAllAutocomplete(
    req.query.query,
    req.query.limit,
    {companyId: req.currentUser.companyId}
  );
  payload = payload.filter(e=> {
    const roles_now = [e.label]
    
    for (let index = 0; index < roles_now.length; index++) {
      const element = roles_now[index];
      if(element != name && role_obj[element]?.includes(name)){
        return true
      }
    }
    return false
  })

  return payload;
}

module.exports = {
  getRolesByGroupName,
  get_role_hierarchy
}