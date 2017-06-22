var baby = require('babyparse');
var fs = require('fs');
var dateFormat = require('dateformat');

var file = process.argv[2]
var isAIB = (process.argv[3] == 'true');

if(file == undefined){
  console.log("Supply a file")
  return
}

if(isAIB){
  //AIB flow
  results = baby.parseFiles([file], {
      download: true,
    })

  if(results[0].errors.length > 0){
      console.log(results[0].errors[0].message )
    }

  var data = []
  results[0].data.splice(0, 1); //remove header
  results[0].data.splice(results[0].data.length -2, results[0].data.length-1);//remove end of file
  for(result of results[0].data) {
    if(result[3] != ""){
      addAIBFee(result)
    }
  }
}else {
  //Fire flow
  results = baby.parseFiles([file], {
      download: true,
      header: true,
    })

    if(results[0].errors.length > 0){
      console.log(results[0].errors[0].message )
    }

    var data = []
    for(result of results[0].data) {
      if(result["date"] != ""){
        addFee(result)
        addFireFee(result)
      }
    }
}

function addAIBFee(result){
  arr = []
  arr.push(result[1])
  if(Number(result[6]) > 0){
    arr.push(result[6])
  }else {
    arr.push("-"+result[5])
  }
  arr.push(result[3])

  data.push(arr)
}

function addFee(result){
  arr = []
  arr.push(dateFormat(result["date"], "dd/mm/yyyy"))
  if(Number(result["amountAfterCharges"].replace(/\,/g,'')) > 0){
    arr.push(result["amountBeforeCharges"].replace(/\,/g,''))
  }else {
    arr.push("-"+result["amountBeforeCharges"].replace(/\,/g,''))
  }
  arr.push(result["myRef"])

  data.push(arr)
}

function addFireFee(result){
  arr = []
  arr.push(dateFormat(result["date"], "dd/mm/yyyy"))
  arr.push("-"+result["feeAmount"])
  arr.push("fire-fee")

  data.push(arr)
}

var csv = baby.unparse({
  	data: data
});
console.log(csv)

newfilename= file.replace(/.csv/g,'')+"-updated.csv"
fs.writeFile(newfilename, csv, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log(newfilename + " was saved!");
});
