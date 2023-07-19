//resolvers for queries and mutations
const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

//resolvers for queries and mutations
const resolvers = {
    Query: {
        //get a single user by username
        me: async (parent, args, context) => {
            if (context.user) {
                try {
                    return await User.findOne({ _id: context.user._id });
                } catch (err) {
                    throw new Error(err);
                }
            } else {
                throw new AuthenticationError('You need to be logged in!');
            }
                
        }
    },
    Mutation: {
        //login with email and password
        login: async (parent, { email, password }) => {
            try {
                const user = User.findOne({ email });
                if (!user) {
                    throw new AuthenticationError('Incorrect email');
                }
                const correctPw = await user.isCorrectPassword(password);
                if (!correctPw) {
                    throw new AuthenticationError('Incorrect password');
                }
                const token = signToken(user);
                return token;
            } catch (err) {
                throw new Error(err);
            }
        },
        //add a new user
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password });
                const token = signToken(user);
                return token;
            } catch (err) {
                throw new Error(err);
            }
        }
    }
};

module.exports = resolvers;