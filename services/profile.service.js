const Profile = require('../models/Profile');
const ProfileService = {};
const calcBMI = require('../utils/bmi');
const {
  updateProfileValidation,
  updateBMIValidation
} = require('../utils/validation');

ProfileService.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { accountId: req.account.accountid },
      '-_id -createdAt -updatedAt -__v -accountId'
    );

    res.status(200).send({
      error: false,
      message: 'Profile retrieved successfully.',
      profile
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

ProfileService.updateProfile = async (req, res) => {
  // input validation
  const { error } = updateProfileValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const profile = await Profile.findOne({ accountId: req.account.accountid });

    try {
      const updated = await Profile.findByIdAndUpdate(
        { _id: profile.id },
        req.body,
        {
          new: true,
          fields: '-_id -createdAt -updatedAt -__v -accountId'
        }
      );

      res.status(200).send({
        error: false,
        message: 'Profile updated successfully.',
        profile: updated
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to updated profile.'
      });
    }
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

ProfileService.calculateBMI = async (req, res) => {
  // input validation
  const { error } = updateBMIValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  const { weight, height } = req.body;

  const bmi = calcBMI(weight, height);

  try {
    const profile = await Profile.findOne({ accountId: req.account.accountid });

    try {
      const updated = await Profile.findByIdAndUpdate(
        { _id: profile.id },
        { weight, height, bmi },
        {
          new: true,
          fields: '-_id -createdAt -updatedAt -__v -accountId'
        }
      );

      res.status(200).send({
        error: false,
        message: 'BMI updated successfully.',
        profile: updated
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to updated profile.'
      });
    }
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

ProfileService.getPro = async (req, res) => {
  try {
    let professionals = await Profile.find({}, 'fullname -_id').populate({
      path: 'accountId',
      select: 'username role',
      match: {
        role: 'Professional'
      }
    });

    professionals = professionals.filter(profile => {
      return profile.accountId !== null;
    });

    res.status(200).send({
      error: false,
      message: 'List of professionals retrieved successfully.',
      professionals
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }

  // custom end point
ProfileService.getChatUser = async (req, res) => {
  //check role
  try {
    const account = await Account.findById(req.account.accountid);
    if (account) {
      if (account.role === "User") {
        try {
          let professionals = await Profile.find({}, 'fullname -_id').populate({
            path: 'accountId',
            select: 'username role',
            match: {
              role: 'Professional'
            }
          });
      
          professionals = professionals.filter(profile => {
            return profile.accountId !== null;
          });
      
          res.status(200).send({
            error: false,
            message: 'List of professionals retrieved successfully.',
            professionals
          });
        } catch (err) {
          console.log(err);
          res.status(500).send({
            error: true,
            message: 'Internal Server Error.'
          });
        }
      }
      if (account.role === "Professional") {
        try {
          let professionals = await Profile.find({}, 'fullname -_id').populate({
            path: 'accountId',
            select: 'username role',
            match: {
              role: 'User'
            }
          });
      
          professionals = professionals.filter(profile => {
            return profile.accountId !== null;
          });
      
          // get conversation
          // this will return all the conver related to this accountId
          const allConversation = await Conversation.find(
            {
              'members.accountId': req.account.accountid
            },
            'members'
          ).populate({
            path: 'members.accountId',
            select: 'username'
          });
          if (!allConversation) {
            return res.status(404).send({
              error: true,
              message: 'No conversations found.'
            });
          }
          //
          allConversation.forEach(conversation => {
            conversation.members = conversation.members.filter(participant => {
              return participant.accountId._id != req.account.accountid;
            });
          });
          // place account id in user in a temp array
          let temp_array = []
          allConversation.forEach(conversation => {
            temp_array.push(conversation.members[0].accountId._id.toString());
          })
          let temp_professionals = []
          professionals.forEach(professional => {
            var x = temp_array.includes(professional.accountId._id.toString())
            if (x) {
              temp_professionals.push(professional)
            }
          })
      
          res.status(200).send({
            error: false,
            message: 'List of users retrieved successfully.',
            professionals: temp_professionals
          });
        } catch (err) {
          console.log(err);
          res.status(500).send({
            error: true,
            message: 'Internal Server Error.'
          });
        }

      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = ProfileService;
