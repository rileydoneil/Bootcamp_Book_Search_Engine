//resolvers for queries and mutations
const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

//resolvers for queries and mutations
const resolvers = {
    Query: {
        //get a single user by username
        me: async (parent, args, context) => {
            console.log(context.user);
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
                const user = await User.findOne({ email });
                if (!user) {
                    throw new AuthenticationError('Incorrect email');
                }

                const correctPw = await user.isCorrectPassword(password);
                if (!correctPw) {
                    throw new AuthenticationError('Incorrect password');
                }
                const token = signToken(user);
                return {token, user};
            } catch (err) {
                throw new Error(err);
            }
        },
        //add a new user
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password });
                const token = signToken(user);
                return {token, user};
            } catch (err) {
                throw new Error(err);
            }
        },
        // save book with type book
        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                try {
                    return await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $addToSet: { savedBooks: input } },
                        { new: true }
                    );
                } catch (err) {
                    throw new Error(err);
                }
            } 
            throw new AuthenticationError('You need to be logged in!');
        },

        //remove book by bookId
        removeBook: async (parent, { bookId }, context) => {
            if(context.user) {
                try {
                    return await User.findOneAndUpdate(
                        { _id: context.user._id },
                        { $pull: { savedBooks: { bookId: bookId } } },
                        { new: true }
                    );

                } catch (err) {
                    throw new Error(err);
                }
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    }
};

module.exports = resolvers;