export default function(message, code, status,res){
    res.status(code).json({message,status});
}