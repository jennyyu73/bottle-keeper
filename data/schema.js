const graphql = require('graphql');
const Bottles = require('./bottles');
const Tokens = require('./tokens');

const {
    GraphQLObjectType, GraphQLString,
    GraphQLID, GraphQLSchema,
    GraphQLList,GraphQLNonNull,
    GraphQLInputObjectType
} = graphql;

const BottlesType = new GraphQLObjectType({
  name: "Bottles",
  fields: () => ({
    id: {type: GraphQLID},
    bottles: {type: GraphQLList(GraphQLString)}
  })
});

const TokensType = new GraphQLObjectType({
  name: "Tokens",
  fields: () => ({
    id: {type: GraphQLID},
    tokens: {type: GraphQLList(GraphQLString)}
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
        message: {type: GraphQLString}
      },
      resolve(parent, args){
        var updated = Bottles.findByIdAndUpdate(args.id,
        {$push: {"bottles": args.message}},
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
        token: {type: GraphQLString}
      },
      resolve(parent, args){
        var updated = Tokens.findByIdAndUpdate(args.id,
        {$push: {"tokens": args.token}},
        (err) => {
          if (err) return res.json({ success: false, error: err });
          return updated;
        });
      }
    },

    removeBottle: {
      type: GraphQLString,
      args: {
        id: {type: GraphQLString}
      },
      async resolve(parent, args){
        var bottlesObject = await Bottles.findById(args.id);
        var bottles = bottlesObject.bottles;
        if (bottles.length > 0){
          var msg = bottles.shift();
          bottlesObject.bottles = bottles;
          bottlesObject.save();
          return msg;
        }
        return "";
      }
    },

    removeToken: {
      type: GraphQLString,
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
        return "";
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
