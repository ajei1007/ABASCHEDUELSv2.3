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

passport.use(
  new JWTstrategy(
    {
      passReqToCallback: true,
      secretOrKey: config.secretKey,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (req, token, done) => {
      try {
        // const permission = (user,route_type,method) => {
        //   let perm = 'NA'

        //   user.roles.map(e=>{
        //     const p = e.dataValues[route_type]
        //     if(p && p != 'NA' && perm != 'E'){
        //       if(p == 'E' || p == 'V'){
        //         perm = p
        //       }
        //     }
        //   })
        //   if(perm == 'E'){
        //     return true
        //   }
        //   if(method == 'GET' && perm == 'V'){
        //     return true
        //   }
        //   return false
        // }
        const user = await UsersDBApi.findBy_auth({
          id: token.user.id,
          cache: true,
        });
        if (user && user.disabled) {
          return done(null, false);  // this returns 401 Unauthorized by passport
        }
        if (user && user.company && user.company.disabled) {
          return done(null, false);  // this returns 401 Unauthorized by passport
        }
        let arr_pieces = req._parsedUrl.pathname.split('/');
        let arr_pieces3 = req.originalUrl.split('?')?.[0]?.split('/');

        arr_pieces.shift();
        let perm = true;
        const paths = {
          events: {
            POST: 'createEvent',
            PUT: 'editEvent',
            DELETE: 'deleteEvent',
          },
          remove_events: {
            POST: 'deleteEvent',
          },
          users: {
            POST: 'createUser',
            PUT: 'editUser',
            DELETE: 'deleteUser',
          },
          subgroups: {
            GET: 'viewSubgroup',
            POST: 'createSubgroup',
            PUT: 'editSubgroups',
            DELETE: 'deleteSubgroup',
          },
          branch: {
            POST: 'createBranch',
            PUT: 'editBranch',
            DELETE: 'deleteBranch',
          },
          availabilities: {
            //POST: 'createAvailability', //patch: commented out so cancel event works for users that dont have create availability permission
            PUT: 'editAvailability',
            DELETE: 'deleteAvailability',
            GET: 'viewAvailability',
          },
          cancellations: {
            POST: 'createCancelation',
            // PUT: 'editCancelation',
            DELETE: 'deleteCancelation',
          },
          flags: {
            GET: 'viewReport',
          },
          statistics: {
            GET: 'viewReport',
          },
        };
        const new_array_pieces = arr_pieces.filter((t) => t != 'scheduler');
        let new_path = '';

        if (new_array_pieces.length == 1) {
          new_path = `${new_array_pieces[0]}`;
        } else {
          new_path = `${new_array_pieces[1]}`;
        }
        if (arr_pieces3.includes('flags')) {
          new_path = 'flags';
        }

        let passby = true;
        if (
          arr_pieces3.includes('scheduler') &&
          arr_pieces3.includes('events')
        ) {
          passby = false;
        }
        if (new_array_pieces.includes('companies')) {
          const role = user.role;
          if (role === 'superAdmin') {
            perm = true;
          } else {
            perm = false;
          }
        } else if (new_array_pieces.includes('request')) {
        } else if (
          new_array_pieces.includes('subgroups') &&
          new_array_pieces.includes('autocomplete')
        ) {
          // 
        } else if (`${req?._parsedUrl?.pathname || ''}`.includes('events/group/ids')) {
          // Group events fetching for calendar - let it pass
        } else if (paths[new_path] && paths[new_path][req.method]) {
          restriction = paths[new_path][req.method];
          perm = false;
          user.roles.map((e) => {
            const p = e[restriction];
            if (p) {
              perm = true;
            }
          });
        }

        //if(arr_pieces)
        // if(arr_pieces.includes('scheduler') || arr_pieces.includes('mobiletokens') || arr_pieces.includes('autocomplete') || arr_pieces.includes('statusevents') || arr_pieces.includes('timeoff') || arr_pieces.includes('timeofftypes') || arr_pieces.includes('clock')){}
        // else if(!arr_pieces.includes('scheduler')){
        //   let route_type = arr_pieces[1]
        //   perm = permission(user,route_type,req.method)
        // }
        // else if(arr_pieces.includes('scheduler')){

        // }
        // if(arr_pieces.includes('events_possible')){
        //   perm = permission(user,'events','POST')
        // }

        // else if(req._parsedUrl.pathname == '/api/scheduler/branches'){
        //   perm = permission(user,'users',req.method)
        // }
        // else if(arr_pieces.includes('scheduler')){
        //   //const route_type = arr_pieces[arr_pieces.length-1]
        //   perm = permission(user,'scheduler',req.method)
        // }
        // else if(arr_pieces.length >= 2 && (arr_pieces.includes('resources') || !arr_pieces.includes('scheduler'))  && arr_pieces[0] == 'api'){
        //   perm = false
        //   let route_type = arr_pieces[1]
        //   perm = permission(user,route_type,req.method)
        // }
        // else if(arr_pieces.length >= 2 && arr_pieces[0] == 'api'){
        //   perm = false
        //   let route_type = arr_pieces[arr_pieces.length-1]
        //   route_type = route_type == 'resources' ? 'users' : route_type
        //   perm = permission(user,route_type,req.method)
        // }

        if (passby && !perm) {
          return done(null, false); // this returns 401 Unauthorized by passport
        }

        req.currentUser = user;
        return done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: '/auth/signin/google/callback',
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      socialStrategy(profile.email, profile, providers.google, done);
    },
  ),
);

passport.use(
  new MicrosoftStrategy(
    {
      clientID: config.oauth.microsoft.clientId,
      clientSecret: config.oauth.microsoft.clientSecret,
      callbackURL: '/auth/signin/microsoft/callback',
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      const email = profile._json.mail || profile._json.userPrincipalName;
      socialStrategy(email, profile, providers.microsoft, done);
    },
  ),
);

function socialStrategy(email, profile, provider, done) {
  db.users
    .findOrCreate({ where: { email, provider } })
    .then(([user, created]) => {
      const body = {
        id: user.id,
        email: user.email,
        name: profile.displayName,
      };
      const token = helpers.jwtSign({ user: body });
      return done(null, { token });
    });
}
