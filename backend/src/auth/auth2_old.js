const config = require('../config');
const providers = config.providers;
const helpers = require('../helpers');
const db = require('../db/models');


const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const UsersDBApi = require('../db/api/users');




passport.use(new JWTstrategy({
  passReqToCallback: true,
  secretOrKey: config.secretKey,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
}, async (req, token, done) => {
  try {
    const permission = (user,route_type,method) => {
      let perm = 'NA'
      
      user.roles.map(e=>{
        const p = e.dataValues[route_type]
        if(p && p != 'NA' && perm != 'E'){
          if(p == 'E' || p == 'V'){
            perm = p
          }
        }
      })
      if(perm == 'E'){
        return true
      }
      if(method == 'GET' && perm == 'V'){
        return true
      }
      return false
    }
    const user = await UsersDBApi.findBy( {email: token.user.email});
    ////console.log('smicky',user);
    if (user && user.disabled) {
      return done (new Error(`User '${user.email}' is disabled`));
    }
    if (user && user.company && user.company.dataValues && user.company.dataValues.disabled) {
      return done (new Error(`Company '${user.company.dataValues.name}' is disabled`));
    }
    let arr_pieces = req._parsedUrl.pathname.split('/')
    arr_pieces.shift()
    const arr_opt = ['/api/auth/me','/api/scheduler/frontend_roles','/api/scheduler/subgroups',]
    const arr_opt2 = ['/api/auth/me','/api/scheduler/frontend_roles','/api/scheduler/subgroups',]
    
    if(!arr_pieces.includes('auth') && !arr_opt.includes(req.originalUrl)){
      let perm = true
      
      //console.log('looper',arr_pieces);
      if(arr_pieces.includes('events_possible')){
        perm = permission(user,'events','POST')
      }
      
      else if(req._parsedUrl.pathname == '/api/scheduler/branches'){
        //console.log('plinter',user.roles);
        perm = permission(user,'users',req.method)
        //console.log('slicker2',req._parsedUrl.pathname,perm);
      }
      else if(arr_pieces.includes('scheduler')){
        //const route_type = arr_pieces[arr_pieces.length-1]
        perm = permission(user,'scheduler',req.method)
        //console.log('smiler',perm);
      }
      else if(arr_pieces.length >= 2 && (arr_pieces.includes('resources') || !arr_pieces.includes('scheduler'))  && arr_pieces[0] == 'api'){
        perm = false
        let route_type = arr_pieces[1]
        perm = permission(user,route_type,req.method)
        //console.log('slooper',perm);
      }
      else if(arr_pieces.length >= 2 && arr_pieces[0] == 'api'){
        perm = false
      //console.log('looper',arr_pieces);
        //console.log('sniffle');
        let route_type = arr_pieces[arr_pieces.length-1]
        route_type = route_type == 'resources' ? 'users' : route_type
        //console.log('lither',user);
        perm = permission(user,route_type,req.method)
        //console.log('slooper',perm);
      }
      //console.log('smoogly3',req,req.pathname,req.originalUrl,req.method);
    
      if(!perm){
      return done (new Error(`'${user.email}' Does not Have access to ${req.originalUrl} with ${req.method} method`));
      }
    }

    req.currentUser = user;
    //console.log('looker2');
    return done(null, user);
  } catch (error) {
    //console.log('looker');
    done(error);
  }
}));

passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: '/auth/signin/google/callback',
    passReqToCallback: true
  },
  function (request, accessToken, refreshToken, profile, done) {
    socialStrategy(profile.email, profile, providers.google, done);
  }
));


passport.use(new MicrosoftStrategy({
    clientID: config.microsoft.clientId,
    clientSecret: config.microsoft.clientSecret,
    callbackURL: '/auth/signin/microsoft/callback',
    passReqToCallback: true
  },
  function (request, accessToken, refreshToken, profile, done) {
    const email = profile._json.mail || profile._json.userPrincipalName;
    socialStrategy(email, profile, providers.microsoft, done);
  }
));

function socialStrategy(email, profile, provider, done) {
  db.users.findOrCreate({where: {email, provider}}).then(([user, created]) => {
    const body = {
      id: user.id,
      email: user.email,
      name: profile.displayName,
    };
    const token = helpers.jwtSign({user: body});
    return done(null, {token});
  });
}
