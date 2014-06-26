function fromListgetScore(list,score){
	var score = score - 0;
	var len = list.length
	for(var i=0;i<len;i++){
		if(score >= list[i].min && score < list[i].max){
			return list[i].score
		}
	}
	return -1
}