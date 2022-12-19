const User = require("../models/User");
const Message = require("../models/Message");
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.TWILIO_TOKEN
);

exports.register = async (req, res) => {
  console.log(req.body);
  let user;
  let { username, phone } = req.body;
  const found = await User.findOne({ phone });
  try {
    if (!found) {
      user = await User.create({
        username,
        phone,
      });
    }
    let message = await client.messages.create({
      body: `Hi ${username} Overall, on the level of 5 how much would you recommend this Hotel for a friend?`,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${phone}`,
    });

    res.status(200).json({
      status: "success",
      message: "created",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

let templateMessageFunction = async (phone, body, path) => {
  let WAmessage = await client.messages.create({
    body: body,
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
  });
  if (path) {
    let updated = await User.updateOne({ phone }, { path, $inc: { phase: 1 } });
  }
};

exports.reply = async (req, res) => {
  try {
    let message = await Message.create(req.body);
    let phone = message.From.replace("whatsapp:", "");
    let found = await User.findOne({ phone });

    if (req.body.Body === "Yes") {
      found.path = null;
      req.body.Body = "3";
    }
    if (req.body.Body === "No") {
      found.path = "done";
      let WAmessage = await client.messages.create({
        body: `We really appreciate taking from your valuable time. Looking forward to see you again and experience the most from our hotels`,
        from: "whatsapp:+14155238886",
        to: `whatsapp:${found.phone}`,
      });
      let updated = await User.updateOne(
        { phone },
        { path: "done", $inc: { phase: 1 } }
      );
      return res.status(200).json({
        status: "success",
        message: "created",
      });
    }
    if (found.path === "done") {
      return res.status(200).json({
        status: "fail",
        message: "unauthorized",
      });
    }
    if (!found.path && req.body.Body === "4") {
      let WAmessage = await client.messages.create({
        body: `Could you please provide your valuable feedback?`,
        from: "whatsapp:+14155238886",
        to: `whatsapp:${found.phone}`,
      });
      let updated = await User.updateOne(
        { phone },
        { path: "done", $inc: { phase: 1 } }
      );
      return res.status(200).json({
        status: "success",
        message: "created",
      });
    }

    if (!found.path && req.body.Body === "5") {
      let WAmessage = await client.messages.create({
        body: `We are really Happy to hear such compliment! Based on this we would like to send you a promotion code to use it in your future visits or share it with a friend. Looking forward to see you again!`,
        from: "whatsapp:+14155238886",
        to: `whatsapp:${found.phone}`,
      });
      let updated = await User.updateOne(
        { phone },
        { path: "done", $inc: { phase: 1 } }
      );

      return res.status(200).json({
        status: "success",
        message: "created",
      });
    }
    if (
      !found.path &&
      (req.body.Body === "1" || req.body.Body === "2" || req.body.Body === "3")
    ) {
      let WAmessage = await client.messages.create({
        body: `We would like to really apologize for not getting the
          maximum experience of our hotels! Could you help us
          identifying the area of improvements to get more attention
          from our side and improve our services?
          1 - Rooms
          2 - Generals
          3 - Hotel Facilities`,
        from: "whatsapp:+14155238886",
        to: `whatsapp:${found.phone}`,
      });
      let updated = await User.updateOne(
        { phone },
        { path: "choosing", $inc: { phase: 1 } }
      );
      return res.status(200).json({
        status: "success",
        message: "created",
      });
    }

    if (found.path === "choosing") {
      switch (req.body.Body) {
        case "1":
          templateMessageFunction(
            phone,
            "Were the hospitality and beverages available at the time of arrival? (1-5)",
            "rooms"
          );

          break;
        case "2":
          templateMessageFunction(
            phone,
            "Was there a variety of cuisines? (1-5)",
            "hotel facilities"
          );
          break;
        case "3":
          templateMessageFunction(
            phone,
            "Rate the room availability please? (1-5)",
            "general"
          );
          break;
        default:
        // code block
      }

      return res.status(200).json({
        status: "success",
        message: "created",
      });
    }

    //rooms
    if (found.path === "rooms") {
      templateMessageFunction(
        phone,
        "How comfortable were the bed, sofa, etc? (1-5)",
        "rooms greeting"
      );
    }
    if (found.path === "rooms greeting") {
      templateMessageFunction(
        phone,
        "Thank you for your valuable feedback! Would you like to rate other services? Yes/No",
        "done"
      );
    }
    //hotel facilities
    if (found.path === "hotel facilities") {
      templateMessageFunction(
        phone,
        "How was the quality of food?",
        "hotel facilities greeting"
      );
    }
    if (found.path === "hotel facilities greeting") {
      templateMessageFunction(
        phone,
        "Thank you for your valuable feedback! Would you like to rate other services? Yes/No",
        "done"
      );
    }
    //general
    if (found.path === "general") {
      templateMessageFunction(
        phone,
        "Was the price of the room convenient ?(1-5)",
        "general greeting"
      );
    }
    if (found.path === "general greeting") {
      templateMessageFunction(
        phone,
        "Thank you for your valuable feedback! Would you like to rate other services? Yes/No",
        "done"
      );
    } else {
      templateMessageFunction(
        phone,
        "The answer is not within the range of possible answers. Please resend the answer again to incorporate it to the survey"
      );
    }
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
