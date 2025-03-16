const exeCuteCodeinBacth = async (req,res) => {
    try {
        const { code } = req.body;
        const { user_id } = req.user;
        const { language } = req.params;
        const { input } = req.query;
        const { output } = req.query;
        const { time } = req.query;
        
    } catch (error) {
        res.json({error:"Server Time out "})
    }
}