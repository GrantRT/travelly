const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment");
const CountryBadge = require("./CountryBadge");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
        "Must be a valid email address",
      ],
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      // match? maybe add a regex here to ensure password strength?
    },
    // not 100% sure these are correct
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    // profile picture using s3?
    profilePicture: {
      type: String,
    },

    savedCountryBadges: [
      {
        type: Schema.Types.ObjectId,
        ref: "CountryBadge",
      },
    ],

    savedActivityBadges: [
      {
        type: Schema.Types.ObjectId,
        ref: "ActivityBadge",
      },
    ],

    // ! Change name to just trips
    upcomingTrips: [
      {
        type: Schema.Types.ObjectId,
        ref: "Trip",
      },
    ],

    // ! We will need to have a function that compares the end date of users trips to current date and adds each country in the trip to the countries visited list when the end date has passed, call the function when user logs in?
    countriesVisited: [
      {
        type: Schema.Types.ObjectId,
        ref: "Country",
      },
    ],
    isCompanyAdmin: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },

  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// function to return following count -- following to be declared in typeDefs?
userSchema.virtual("followingCount").get(function () {
  return this.following.length;
});

// function to return follower count -- followers to be declared in typeDefs?
userSchema.virtual("followerCount").get(function () {
  return this.followers.length;
});

// function to create bucketList array made up of all of the countryIds included in the users savedCountryBadges array
// ! Bucket list virtual returns an array of country IDS which is all we really need but curious as to how we could populate it with country info as was unable to get that to work
userSchema.virtual("bucketList").get(function () {
  const bucketList = [];
  this.savedCountryBadges.forEach((badge) => {
    bucketList.push(
      // Mapping over the countries array of each badge and returning an array that contains each country _id
      // Using the spread operator so that we are just pushing the individual values into bucket list and not the array as a whole
      ...badge.countries.map((country) => {
        return country._id;
      })
    );
  });
  return bucketList;
});

// Function to return array of trips whose endDate has passed
userSchema.virtual("pastTrips").get(function () {
  const endDatePassed = this.upcomingTrips.filter((trip) => {
    return moment(trip.endDate, "DD/MM/YYYY").unix() * 1000 < Date.now();
  });
  return endDatePassed.map((trip) => trip);
});

// Function to return array of trips whose endDate has NOT passed
userSchema.virtual("futureTrips").get(function () {
  const futureTrips = this.upcomingTrips.filter((trip) => {
    return moment(trip.endDate, "DD/MM/YYYY").unix() * 1000 > Date.now();
  });
  return futureTrips.map((trip) => trip);
});

userSchema.virtual("visitedCountries").get(function () {
  // ! Would be interested to know why this reduce function wouldn't work
  // ? Was returning the number 2
  // const visitedCountries = this.pastTrips.reduce((total, curr, i) => {
  //   console.log(total);
  //   return total.push(...curr.countries);
  // }, []);
  // ? This works though :)
  const visitedCountries = [];
  this.pastTrips.forEach((trip) => {
    visitedCountries.push(...trip.countries);
  });

  return visitedCountries;
});

// ! Not currently working :/
userSchema.virtual("earnedBadges").get(function () {
  CountryBadge.find({})
    .then((allCountryBadges) => {
      // Filtering through country badges
      const earnedBadges = allCountryBadges.filter((badge) => {
        if (badge.countries.length === 0) {
          return false;
        }

        // Array of the ids of the users visitedCountries
        const visitedCountryIds = this.visitedCountries.map((c) =>
          c._id.toString()
        );

        // .every SHOULD return true, if visitedCountryIds contains every country on the badge, meaning the user has earned it

        return badge.countries.every((country) => {
          console.log("    ");
          console.log("Array: visitedCountryIds");
          console.log(typeof visitedCountryIds[0]);
          console.log("    ");
          console.log("Variable: country");
          console.log(typeof country.toString());
          console.log("    ");
          console.log("visitedCountryIds.includes(country)");
          console.log(visitedCountryIds.includes(country.toString()));
          return visitedCountryIds.includes(country.toString());
        });
      });

      return earnedBadges.map((c) => c._id);
    })
    .then((earnedBadges) => {
      console.log(earnedBadges);
      return earnedBadges;
    });
});

// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

module.exports = User;
