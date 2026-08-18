const permission = (user,route_type) => {
    let perm = 'NA'
    user.roles.map(e=>{
      const p = e.dataValues[route_type]
      if(p && p != 'NA' && perm != 'E'){
        if(p == 'E' || p == 'V'){
          perm = p
        }
      }
    })
    return perm
  }
  
  module.exports = permission;