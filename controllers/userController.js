const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || "secret";

function getStartupCode(language) {
  if (language.toLowerCase() === "python") {
    return 'print("Hello World")';
  } else if (language.toLowerCase() === "java") {
    return 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }';
  } else if (language.toLowerCase() === "javascript") {
    return 'console.log("Hello World");';
  } else if (language.toLowerCase() === "cpp") {
    return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
  } else if (language.toLowerCase() === "c") {
    return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
  } else if (language.toLowerCase() === "go") {
    return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}';
  } else if (language.toLowerCase() === "bash") {
    return 'echo "Hello World"';
  } else {
    return 'Language not supported';
  }
}
exports.signUp = async (req, res) => {
  try {
    let { email, pwd, fullName } = req.body;

    // Validation
    if (!email || !pwd || !fullName) {
      return res.status(400).json({
        success: false,
        msg: "Email, password, and full name are required"
      });
    }

    let emailCheck = await userModel.findOne({ email: email });
    if (emailCheck) {
      return res.status(400).json({
        success: false,
        msg: "Email already registered"
      });
    }

    bcrypt.genSalt(12, function (err, salt) {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: "Error hashing password"
        });
      }

      bcrypt.hash(pwd, salt, async function (err, hash) {
        if (err) {
          return res.status(500).json({
            success: false,
            msg: "Error hashing password"
          });
        }

        try {
          let user = await userModel.create({
            email: email,
            password: hash,
            name: fullName,
            created_at: new Date(),
            last_active: new Date()
          });

          return res.status(200).json({
            success: true,
            msg: "User created successfully",
            userId: user._id
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            msg: error.message
          });
        }
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, pwd } = req.body;

    // Validation
    if (!email || !pwd) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    bcrypt.compare(pwd, user.password, async function (err, result) {
      if (result) {
        // Update last_active timestamp without triggering full schema validation
        await userModel.findByIdAndUpdate(user._id, { last_active: new Date() }, { new: true, runValidators: false });

        let token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

        return res.status(200).json({
          success: true,
          msg: "User logged in successfully",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
      }
      else {
        return res.status(401).json({
          success: false,
          msg: "Invalid password"
        });
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.createProj = async (req, res) => {
  try {
    let { name, description, token, language } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        msg: "Project name is required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Default language to javascript if not provided
    const projectLanguage = language || 'javascript';
    
    let project = await projectModel.create({
      owner_id: user._id,
      name: name,
      description: description || '',
      language: projectLanguage,
      code: getStartupCode(projectLanguage),
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.status(200).json({
      success: true,
      msg: "Project created successfully",
      projectId: project._id,
      project: project
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.saveProject = async (req, res) => {
  try {
    let { token, projectId, code, files, fileTree } = req.body;

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Update with either fileTree or files array or just code
    const updateData = {};
    if (fileTree && Array.isArray(fileTree)) {
      updateData.fileTree = fileTree;
    }
    if (files && Array.isArray(files)) {
      updateData.files = files;
    }
    if (code !== undefined) {
      updateData.code = code;
    }

    let project = await projectModel.findOneAndUpdate(
      { _id: projectId },
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Project saved successfully",
      project: project
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.getProjects = async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        msg: "Token is required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Fetch all projects for this user, sorted by updated_at
    let projects = await projectModel.find({ owner_id: user._id })
      .sort({ updated_at: -1 })
      .select('_id name description language created_at updated_at');

    return res.status(200).json({
      success: true,
      msg: "Projects fetched successfully",
      projects: projects,
      total: projects.length
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};

exports.getProject = async (req, res) => {
  try {

    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOne({ _id: projectId });

    if (project) {
      return res.status(200).json({
        success: true,
        msg: "Project fetched successfully",
        project: project
      });
    }
    else {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.deleteProject = async (req, res) => {
  try {

    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOneAndDelete({ _id: projectId });

    return res.status(200).json({
      success: true,
      msg: "Project deleted successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.editProject = async (req, res) => {
  try {

    let {token, projectId, name} = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOne({ _id: projectId });
    if(project){
      project.name = name;
      await project.save();
      return res.status(200).json({
        success: true,
        msg: "Project edited successfully"
      })
    }
    else{
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      })
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

// Get user data
exports.getUserData = async (req, res) => {
  try {
    let { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        msg: "Token is required"
      });
    }

    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId }).select('_id name email created_at last_active');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "User data fetched successfully",
      user: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    });
  }
};