// const express = require('express');
// const router = express.Router();
// const auth = require('../middlewares/auth');
// const { compileAndRunJava } = require('../utils/compileRunner');
// const Submission = require('../models/Submission');

// // compile Java (protected)
// router.post('/java', auth, async (req, res) => {
//   try {
//     const { code, save } = req.body;
//     if (!code) return res.status(400).json({ msg: 'No code provided' });
//     const result = await compileAndRunJava(code, 5000);
//     if (save) {
//       await Submission.create({
//         user: req.user._id,
//         code,
//         language: 'java',
//         saved: true,
//         result: { stdout: result.stdout || '', stderr: result.stderr || '', exitCode: result.exitCode || null }
//       });
//     }
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'Server error', error: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { compileAndRunJava } = require('../utils/compileRunner');

// Public compile route (no authentication needed)
router.post('/java', async (req, res) => {
  try {
    const { code, inputs = [] } = req.body;
    
    if (!code) {
      return res.status(400).json({ msg: 'No code provided' });
    }

    // Validate code size
    if (code.length > 10000) {
      return res.status(400).json({ msg: 'Code too large. Maximum 10,000 characters allowed.' });
    }

    // Validate that code contains Main class and main method
    if (!code.includes('class Main') && !code.includes('public class Main')) {
      return res.status(400).json({ 
        msg: 'Java code must contain a Main class',
        stage: 'compile',
        success: false 
      });
    }

    if (!code.includes('main(String[] args)')) {
      return res.status(400).json({ 
        msg: 'Java code must contain a main method: public static void main(String[] args)',
        stage: 'compile',
        success: false 
      });
    }

    console.log('Compiling Java code with inputs:', inputs);
    const result = await compileAndRunJava(code, 15000, inputs);

    res.json(result);

  } catch (err) {
    console.error('Compilation error:', err);
    res.status(500).json({ 
      msg: 'Server error during compilation',
      error: err.message,
      stage: 'server',
      success: false
    });
  }
});

module.exports = router;