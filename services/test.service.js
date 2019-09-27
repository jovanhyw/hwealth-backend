const TestService = {};

TestService.hello = async (req, res) => {
  try {
    res.status(200).send({
      error: false,
      message: 'hello world!!! api is working!!!'
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Something went wrong.'
    });
  }
};

module.exports = TestService;
