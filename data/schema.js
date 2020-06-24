const graphql = require('graphql');
const Bottles = require('./bottles');
const Tokens = require('./tokens');

const {
    GraphQLObjectType, GraphQLString,
    GraphQLID, GraphQLSchema,
    GraphQLList,GraphQLNonNull,
    GraphQLInputObjectType
} = graphql;

const BottleType = new GraphQLObjectType({
  name: "Bottle",
  fields: () => ({
    message: {type: GraphQLString},
    psid: {type: GraphQLString}
  })
});

const BottleInputType = new GraphQLInputObjectType({
  name: "BottleInput",
  fields: () => ({
    message: {type: GraphQLString},
    psid: {type: GraphQLString}
  })
});

const BottlesType = new GraphQLObjectType({
  name: "Bottles",
  fields: () => ({
    id: {type: GraphQLID},
    bottles: {type: GraphQLList(BottleType)}
  })
});

const TokenType = new GraphQLObjectType({
  name: "Token",
  fields: () => ({
    token: {type: GraphQLString},
    psid: {type: GraphQLString}
  })
});

const TokenInputType = new GraphQLInputObjectType({
  name: "TokenInput",
  fields: () => ({
    token: {type: GraphQLString},
    psid: {type: GraphQLString}
  })
});

const TokensType = new GraphQLObjectType({
  name: "Tokens",
  fields: () => ({
    id: {type: GraphQLID},
    tokens: {type: GraphQLList(TokenType)}
  })
});

const MessageTokenPairType = new GraphQLObjectType({
  name: "MessageTokenPair",
  fields: () => ({
    message: {type: GraphQLString},
    token: {type: GraphQLString}
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    bottles: {
      type: BottlesType,
      args:{
        id: {type: GraphQLString}
      },
      resolve(parent, args){
        return Bottles.findById(args.id);
      }
    },

    allBottles:{
      type: new GraphQLList(BottlesType),
      resolve(parent, args){
        return Bottles.find({});
      }
    },

    tokens: {
      type: TokensType,
      args:{
        id: {type: GraphQLString}
      },
      resolve(parent, args){
        return Tokens.findById(args.id);
      }
    },

    allTokens:{
      type: new GraphQLList(TokensType),
      resolve(parent, args){
        return Tokens.find({});
      }
    },
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    newBottleList: {
      type: BottlesType,
      resolve(parent, args){
        let bottles = new Bottles({bottles: []});
        return bottles.save();
      }
    },

    newTokensList: {
      type: TokensType,
      resolve(parent, args){
        let tokens = new Tokens({tokens: []});
        return tokens.save();
      }
    },

    addBottle: {
      type: BottlesType,
      args: {
        id: {type: GraphQLString},
        bottle: {type: BottleInputType},
      },
      resolve(parent, args){
        var updated = Bottles.findByIdAndUpdate(args.id,
        {$push: {"bottles": args.bottle}},
        (err) => {
          if (err) return res.json({ success: false, error: err });
          return updated;
        });
      }
    },

    addToken: {
      type: TokensType,
      args: {
        id: {type: GraphQLString},
        token: {type: TokenInputType}
      },
      async resolve(parent, args){
        /*
        var updated = Tokens.findByIdAndUpdate(args.id,
        {$push: {"tokens": args.token}},
        (err) => {
          if (err) return res.json({ success: false, error: err });
          return updated;
        });
        */
        //only adds token if user psid not already in list of tokens
        var tokensObject = await Tokens.findById(args.id);
        var tokens = tokensObject.tokens;
        var notInList = true;
        for (var i = 0; i < tokens.length; i++){
          if (tokens[i].psid == args.token.psid)
            notInList = false;
        }
        if (notInList)
          tokens.push(args.token);
        tokensObject.tokens = tokens;
        tokensObject.save();
        return tokensObject;
      }
    },

    removeBottle: {
      type: BottleType,
      args: {
        id: {type: GraphQLString}
      },
      async resolve(parent, args){
        var bottlesObject = await Bottles.findById(args.id);
        var bottles = bottlesObject.bottles;
        if (bottles.length > 0){
          var bottle = bottles.shift();
          bottlesObject.bottles = bottles;
          bottlesObject.save();
          return bottle;
        }
        return null;
      }
    },

    removeToken: {
      type: TokenType,
      args: {
        id: {type: GraphQLString}
      },
      async resolve(parent, args){
        var tokensObject = await Tokens.findById(args.id);
        var tokens = tokensObject.tokens;
        if (tokens.length > 0){
          var token = tokens.shift();
          tokensObject.tokens = tokens;
          tokensObject.save();
          return token;
        }
        return null;
      }
    },

    getMessageTokenPair: {
      type: new GraphQLList(MessageTokenPairType),
      args: {
        bottlesId: {type: GraphQLString},
        tokensId: {type: GraphQLString}
      },
      async resolve(parent, args){
        var tokensObject = await Tokens.findById(args.tokensId);
        var bottlesObject = await Bottles.findById(args.bottlesId);
        var tokens = tokensObject.tokens;
        var bottles = bottlesObject.bottles;
        if (bottles.length == 0 || tokens.length == 0){
          return [];
        }
        var pairs = [];

        var i = 0;
        while (i < tokens.length){
          var j = 0;
          var found = false;
          while (j < bottles.length){
            if (tokens[i].psid != bottles[j].psid){
              pairs.push({
                message: bottles[j].message,
                token: tokens[i].token
              });
              tokens.splice(i, 1);
              bottles.splice(j, 1);
              found = true;
              break;
            }
            else {
              j ++;
            }
          }
          if (!found)
            i++;
        }
        tokensObject.save();
        bottlesObject.save();
        return pairs;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
