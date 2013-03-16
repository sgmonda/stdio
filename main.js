/**
 * Parses command line options
 * @param {function} arguments vector
 */
module.exports.getopt = function(options){
    
    var argv = process.argv,     // Arguments
        opts = {},               // Options map
        arg,                     // Every argument
        spected;
        
    // Arguments parsing
    argv.shift() && argv.shift();

    for(var i = 0, len = argv.length; i < len, arg = argv[i]; i++){
        var opt = null, optname = null;
        if(arg.charAt(0) == '-') {
            opt = {}, spected = null;
            if(arg.charAt(1) == '-') {
                // It's a long option                
                optname = arg.substring(2);
                spected = options[optname];
                if(!spected) throw new Error('Unknown option: --' + optname);                
            } else {
                // It's a short option
                for(var name in options){
                    if(options[name].key == arg.substring(1)){
                        optname = name;
                        break;
                    }
                }
                spected = options[optname];
                if(!spected) throw new Error('Unknown option: -' + arg.substring(1));                
            }

            // Arguments asociated with this option
            if(spected.args == 1){
                opt.args = argv[++i];
            } else if(spected.args) {
                opt.args = [];
                for(var j = i + 1; j < i + 1 + (spected.args || 0); j++){
                    opt.args.push(argv[j]);
                }
                i += spected.args;
            }else{
                opt = true;
            }
            
            if(opt){
                opts[optname] = opt;
            }
        } else {
            if(!opts.args) opts.args = [];
            opts.args.push(argv[i]);
        }
        
        
    }

    return opts;
    
};

/**
 * Reads the complete standard input
 * @param {function} callback
 */
module.exports.read = function(callback){

    if(!callback) throw new Error('no callback provided to readInput() call');

    var inputdata = '';
    
    process.stdin.resume();    
    process.stdin.on('data', function(text){
        inputdata += String(text);
    });
    process.stdin.on('end', function(){
        callback && callback(inputdata);
    });
    
};