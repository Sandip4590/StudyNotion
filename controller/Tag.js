const Tag = require("../models/Tags");

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields Are required",
      });
    }
    const tagMail = await Tag.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      success: true,
      message: "Tag Created SuccessFully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.showAllTags  = async( req,res) => {

    try{

        const tags = await Tag.find({},{name:true,description:true})
        return res.status(200).json({
            success:true,
            message:"All Tags return SuccessFully",
            tags
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}