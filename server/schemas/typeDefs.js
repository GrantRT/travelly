const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Company {
    _id: ID!
    companyUserName: String!
    email: String!
    password: String!
    isCompanyAdmin: Boolean!
    isAdmin: Boolean!
  }

  type Admin {
    _id: ID!
    email: String!
    password: String!
    isCompanyAdmin: Boolean!
    isAdmin: Boolean!
  }

  type Trip {
    _id: ID!
    tripName: String!
    tripDescription: String!
    startDate: String!
    endDate: String!
  }

  type Activity {
    _id: ID!
    activityName: String!
  }

  type ActivityBadge {
    _id: ID!
    badgeName: String!
    badgeImage: String
    activities: [Activity]
  }

  type Country {
    _id: ID!
    countryName: String!
  }

  type CountryBadge {
    _id: ID!
    badgeName: String!
    badgeImage: String
    countries: [Country]
  }

  type Comment {
    _id: ID!
    postId: ID!
    userId: ID!
    commentText: String!
  }

  type Post {
    _id: ID!
    userId: ID!
    postText: String!
    comments: [Comment]
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    bio: String
    posts: [Post]
  }

  type Query {
    me: User
  }

  type Mutation {
    addUser(
      username: String!
      email: String!
      password: String!
      bio: String
    ): User

    addCompany(
      companyUserName: String!
      email: String!
      password: String!
    ): Company

    addAdmin(email: String!, password: String!): Admin

    loginUser(email: String!, password: String!): User
    loginCompany(email: String!, password: String!): Company
    loginAdmin(email: String!, password: String!): Admin

    addTrip(
      tripName: String!
      tripDescription: String!
      startDate: String!
      endDate: String
    ): Trip

    addActivity(activityName: String!): Activity

    addActivityBadge(
      badgeName: String!
      badgeImage: String
      activities: [ID]
    ): ActivityBadge

    addCountry(countryName: String!): Country

    addCountryBadge(
      badgeName: String!
      badgeImage: String
      countries: [ID]
    ): CountryBadge

    addPost(userId: ID!, postText: String!): User

    addComment(userId: ID!, commentText: String!, postId: ID!): Post
  }
`;

module.exports = typeDefs;

// ! how do we link the comments to the posts?
