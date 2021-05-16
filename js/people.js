class People{
	static idStatic = 0;
	
	constructor(cId, cCult, resBorn){
		this.data = {	'alive':PeopleAlive.no, 
						'posX':0, 
						'posY':0, 
						'cId':cId, 
						'cCult':cCult, 
						'resCt':resBorn, 
						'power':0, 
						'collect':0, 
						'recycle':0, 
						'consume':0,
						'resCell':{'posX':-1, 'posY':-1},
						'starve':PeopleStarve.no,
						'pNearList':{'nrW':PeopleId.none, 'nrE':PeopleId.none, 'nrN':PeopleId.none, 'nrS':PeopleId.none}, 
						'age':PeopleAge.none,
						'cbtCt':0, 
						'cbtWn':0, 
						'cbtWR':null,
						'cbtDir':Direct.none, 
						'feedDir':Direct.none,
						'id':PeopleId.none, 
						'fmName':'',
						'gvName':'',
						'direct':Direct.none,
						'resCombat':0,
						'resCollect':0,
						'resRecycle':0,
						'resConsume':0,
						'dayUpgradeNext':DayPeopleUpgrade,
						};

		if (cId == CityId.none){	//专门设计给读档
			People.idStatic += 1;
			return;
		}

		this.data.consume = PeopleConsume.max;	//TODO:应该设计成消耗大于（不等于）回收

		this.data.collect = PeopleCollect.min;//getRandom(1, PeopleCollect.max);
		this.data.recycle = PeopleRecycle.min;//getRandom(1, PeopleRecycle.max);
		this.data.power = PeoplePower.min;//getRandom(1, PeoplePower.max);

		//console.log(this.data.collect, this.data.recycle, this.data.power);
		
		//随机生成居民
		var countRetry = 0;		
		var maxRetry = 20;
		var peopleConflict = 0;
		var city = cityList[this.data.cId];
		do{
			peopleConflict = 0;
			this.data.posX = getRandom(city.data.posX-city.data.citySize, city.data.posX+city.data.citySize+1);
			this.data.posY = getRandom(city.data.posY-city.data.citySize, city.data.posY+city.data.citySize+1);
			//console.log(this.data.posX);
			//console.log(this.data.posY);

			if (mapMain.data.cells[this.data.posX][this.data.posY].pId != PeopleId.none || mapMain.data.cells[this.data.posX][this.data.posY].cBase == CityBase.center){
				peopleConflict = 1;
			}
			countRetry += 1;
		}while(peopleConflict == 1 && countRetry < maxRetry);		
		
		//console.log(countRetry, this.data.posX, this.data.posY);
		
		if (countRetry >= maxRetry){
			this.data.id = PeopleId.none;
			return;
		}		
		
		this.data.alive = PeopleAlive.yes;
		this.data.id = People.idStatic;
		People.idStatic += 1;
		this.data.fmName = cityList[this.data.cId].data.fmName;
		this.data.gvName = getGivenName();
		this.data.dayUpgradeNext = getRandom(DayPeopleUpgrade/2, DayPeopleUpgrade*3/2);
		
		//从城市信息获取资源格位置
		var resCellList = cityList[this.data.cId].data.resCellList;
		if (resCellList != null && resCellList.length > 0) {
			var resCell = resCellList[getRandom(0, resCellList.length)];
			this.data.resCell.posX = resCell.posX;
			this.data.resCell.posY = resCell.posY;
		}
		
		mapMain.data.cells[this.data.posX][this.data.posY].pId = this.data.id;
		cityList[this.data.cId].data.pAliveList.push(this.data.id);
		glbData.pAliveList.push(this.data.id);
	}
	
	upgrade() {
		var city = cityList[this.data.cId];
		if (city != null && glbData.dayMain >= this.data.dayUpgradeNext) {
			if (this.data.collect != PeopleCollect.max-1) {
				var upgradeToday = getRandom(1, this.data.age)<PeopleCollect.max?1:0;
				this.data.collect = Math.min(this.data.collect + upgradeToday, PeopleCollect.max-1);
				if (this.data.collect == PeopleCollect.max-1 && this.data.recycle == PeopleRecycle.max-1 && this.data.power == PeoplePower.max-1) {
					addBio("【"+city.data.fmName+"】家族【"+city.data.cityName+"】城《"+this.data.fmName+this.data.gvName+"》能力满级。");
				}
			}
			
			if (this.data.recycle != PeopleRecycle.max-1) {
				var upgradeToday = getRandom(1, this.data.age)<PeopleRecycle.max?1:0;
				this.data.recycle = Math.min(this.data.recycle + upgradeToday, PeopleRecycle.max-1);
				if (this.data.collect == PeopleCollect.max-1 && this.data.recycle == PeopleRecycle.max-1 && this.data.power == PeoplePower.max-1) {
					addBio("【"+city.data.fmName+"】家族【"+city.data.cityName+"】城《"+this.data.fmName+this.data.gvName+"》能力满级。");
				}
			}			
			
			if (this.data.power != PeoplePower.max-1) {
				var upgradeToday = getRandom(1, this.data.age)<PeoplePower.max?1:0;
				this.data.power = Math.min(this.data.power + upgradeToday, PeoplePower.max-1);
				if (this.data.collect == PeopleCollect.max-1 && this.data.recycle == PeopleRecycle.max-1 && this.data.power == PeoplePower.max-1) {
					addBio("【"+city.data.fmName+"】家族【"+city.data.cityName+"】城《"+this.data.fmName+this.data.gvName+"》能力满级。");
				}
			}
			
			this.data.dayUpgradeNext = glbData.dayMain + getRandom(DayPeopleUpgrade/2, DayPeopleUpgrade*3/2);
		}
	}

	move(weightWest, weightEast, weightNorth, weightSouth){
		var countRetry = 0;		
		var maxRetry = 20;
		var moveConflict = 0;
		var temp = {'posX':0, 'posY':0};

		do{
			moveConflict = 0;
			temp.posX = this.data.posX;
			temp.posY = this.data.posY;
			var direct = Direct.none;
			var directWtWest = weightWest;
			var directWtEast = weightEast;
			var directWtNorth = weightNorth;
			var directWtSouth = weightSouth;
			var directRand = getRandom(0, directWtWest+directWtEast+directWtNorth+directWtSouth); //加权方式，求出最大权重和各个方向的权重
			if (directRand < directWtWest){
				direct = Direct.west;
				temp.posX -= 1;
				//console.log("WEST");
			}
			else if (directRand < directWtWest+directWtEast){
				direct = Direct.east;
				temp.posX += 1;
				//console.log("EAST");
			}
			else if (directRand < directWtWest+directWtEast+directWtNorth){
				direct = Direct.north;
				temp.posY -= 1;
				//console.log("NORTH");
			}
			else if (directRand < directWtWest+directWtEast+directWtNorth+directWtSouth){
				direct = Direct.south;
				temp.posY += 1;
				//console.log("SOUTH");
			}
			
			if (mapMain.data.cells[temp.posX][temp.posY].ter == Terrain.water || mapMain.data.cells[temp.posX][temp.posY].pId != PeopleId.none){
				moveConflict = 1;
				//console.log("water or people");
			}
			else if (mapMain.data.cells[temp.posX][temp.posY].cId > CityId.none){
				if (mapMain.data.cells[temp.posX][temp.posY].cId != this.data.cId){	//当碰撞检测到别的城市时
					moveConflict = 1;
					//console.log("other city");
				}
				else if(mapMain.data.cells[temp.posX][temp.posY].cBase == CityBase.center){	//当碰撞检测到本方城市中心时
					moveConflict = 1;
					//console.log("own city");
				}
			}
			countRetry += 1;
		}while(moveConflict == 1 && countRetry < maxRetry);
		
		if (countRetry >= maxRetry){
			return;
		}

		//console.log("retry", countRetry);
		
		//移动时增加道路计数器
		var roadCount = Rdcount.none;
		if (direct == Direct.west){
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].rdW, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].rdW = roadCount;
			mapMain.data.cells[temp.posX][temp.posY].rdE = roadCount;
		}
		else if (direct == Direct.east){
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].rdE, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].rdE = roadCount;
			mapMain.data.cells[temp.posX][temp.posY].rdW = roadCount;
		}
		else if (direct == Direct.north){
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].rdN, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].rdN = roadCount;
			mapMain.data.cells[temp.posX][temp.posY].rdS = roadCount;
		}
		else if (direct == Direct.south){
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].rdS, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].rdS = roadCount;
			mapMain.data.cells[temp.posX][temp.posY].rdN = roadCount;
		}
		
		this.data.direct = direct;
		mapMain.data.cells[this.data.posX][this.data.posY].pId = PeopleId.none;	//从旧单元格清除当前人物id
		this.data.posX = temp.posX;
		this.data.posY = temp.posY;
		mapMain.data.cells[this.data.posX][this.data.posY].pId = this.data.id;	//向新的单元格写入当前人物id
		
		//记录新单元格信息，例如是否有食物
		if (mapMain.data.cells[this.data.posX][this.data.posY].resCt != ResCount.none){
			this.data.resCell.posX = this.data.posX;
			this.data.resCell.posY = this.data.posY;
		}
	}

	explore(){
		//随机生成方向，来时的方向尽可能避免，权重值设为最小，走过的路尽量避免
		var directWtWest = (this.data.direct==Direct.west)?(Rdcount.max*2):((this.data.direct==Direct.east)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].rdW));
		var directWtEast = (this.data.direct==Direct.east)?(Rdcount.max*2):((this.data.direct==Direct.west)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].rdE));
		var directWtNorth = (this.data.direct==Direct.north)?(Rdcount.max*2):((this.data.direct==Direct.south)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].rdN));
		var directWtSouth = (this.data.direct==Direct.south)?(Rdcount.max*2):((this.data.direct==Direct.north)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].rdS));		

		this.move(directWtWest, directWtEast, directWtNorth, directWtSouth);
	}
	
	go(posX, posY){
		//指定方向
		var directWtWest = (posX < this.data.posX)?Rdcount.max:1;
		var directWtEast = (posX > this.data.posX)?Rdcount.max:1;
		var directWtNorth = (posY < this.data.posY)?Rdcount.max:1;
		var directWtSouth = (posY > this.data.posY)?Rdcount.max:1;
		
		this.move(directWtWest, directWtEast, directWtNorth, directWtSouth);
	}
	
	collect(){
		var collectThis = Math.min(mapMain.data.cells[this.data.posX][this.data.posY].resCt, this.data.collect);	//采集能力和该格子剩余量较小值
		collectThis = Math.min(collectThis, PeopleResCt.max-this.data.resCt);	//前述较小值与储存空间余量较小值
		this.data.resCt += collectThis;
		mapMain.data.cells[this.data.posX][this.data.posY].resCt -= collectThis;
		this.data.resCollect += collectThis;
	}
	
	consume(){
		//var resConsume = Math.min(this.data.consume, this.data.resCt);
		//仅当不在矿区的时候消耗食物，并且立刻回收一部分食物（不占用行动）
		if (mapMain.data.cells[this.data.posX][this.data.posY].resTp != ResType.food) {
			if (mapMain.data.cells[this.data.posX][this.data.posY].cCult == this.data.cCult) {	//在自己的疆域上
				this.data.consume = Math.ceil((PeopleConsume.max + this.data.recycle)/2); //(消耗-生产)比正常的减半
			}
			else {
				this.data.consume = PeopleConsume.max;
			}
			this.data.resCt -= this.data.consume;
			this.data.resConsume -= this.data.consume;
			this.data.resCt += this.data.recycle;
			this.data.resRecycle += this.data.recycle;
		}
		if (this.data.resCt <= PeopleResCt.none){	//没有食物了，死亡
			this.dead();
		}	
	}
	
	grow(){
		this.data.age += 1;
		if (getRandom(this.data.age, PeopleAge.max+1) == PeopleAge.max){	//年龄太大了，死亡
			this.dead();
		}			
	}
	
	dead(){
		mapMain.data.cells[this.data.posX][this.data.posY].pId = PeopleId.none;
		if (cityList[this.data.cId] != null) {
			var peoplel = cityList[this.data.cId].data.pAliveList;
			peoplel.splice(peoplel.indexOf(this.data.id), 1);
		}
		var peoplel = glbData.pAliveList;
		peoplel.splice(peoplel.indexOf(this.data.id), 1);
		this.data.alive = PeopleAlive.no;
	}
	
	near(){
		this.data.pNearList.nrW = mapMain.data.cells[this.data.posX-1][this.data.posY].pId;
		this.data.pNearList.nrE = mapMain.data.cells[this.data.posX+1][this.data.posY].pId;
		this.data.pNearList.nrN = mapMain.data.cells[this.data.posX][this.data.posY-1].pId;
		this.data.pNearList.nrS = mapMain.data.cells[this.data.posX][this.data.posY+1].pId;
	}

	getEnemy(){
		this.data.cbtDir = Direct.none;
		var peopleIdEnemy = PeopleId.none;
		
		var directWtWest = (this.data.pNearList.nrW!=PeopleId.none && peopleList[this.data.pNearList.nrW].data.cCult != this.data.cCult)?1:0;
		var directWtEast = (this.data.pNearList.nrE!=PeopleId.none && peopleList[this.data.pNearList.nrE].data.cCult != this.data.cCult)?1:0;
		var directWtNorth = (this.data.pNearList.nrN!=PeopleId.none && peopleList[this.data.pNearList.nrN].data.cCult != this.data.cCult)?1:0;
		var directWtSouth = (this.data.pNearList.nrS!=PeopleId.none && peopleList[this.data.pNearList.nrS].data.cCult != this.data.cCult)?1:0;
		
		var directRand = getRandom(0, directWtWest+directWtEast+directWtNorth+directWtSouth); //加权方式，求出最大权重和各个方向的权重
		if (directRand < directWtWest){
			peopleIdEnemy = this.data.pNearList.nrW;
			this.data.cbtDir = Direct.west;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		else if (directRand < directWtWest+directWtEast){
			peopleIdEnemy = this.data.pNearList.nrE;
			this.data.cbtDir = Direct.east;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth){
			peopleIdEnemy = this.data.pNearList.nrN;
			this.data.cbtDir = Direct.north;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth+directWtSouth){
			peopleIdEnemy = this.data.pNearList.nrS;
			this.data.cbtDir = Direct.south;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		
		return peopleIdEnemy;
	}
	
	getFriend(){
		this.data.feedDir = Direct.none;
		var peopleIdFriend = PeopleId.none;
		
		var directWtWest = (this.data.pNearList.nrW!=PeopleId.none && peopleList[this.data.pNearList.nrW].data.cCult == this.data.cCult)?1:0;
		var directWtEast = (this.data.pNearList.nrE!=PeopleId.none && peopleList[this.data.pNearList.nrE].data.cCult == this.data.cCult)?1:0;
		var directWtNorth = (this.data.pNearList.nrN!=PeopleId.none && peopleList[this.data.pNearList.nrN].data.cCult == this.data.cCult)?1:0;
		var directWtSouth = (this.data.pNearList.nrS!=PeopleId.none && peopleList[this.data.pNearList.nrS].data.cCult == this.data.cCult)?1:0;
		
		var directRand = getRandom(0, directWtWest+directWtEast+directWtNorth+directWtSouth); //加权方式，求出最大权重和各个方向的权重
		if (directRand < directWtWest){
			peopleIdFriend = this.data.pNearList.nrW;
			this.data.feedDir = Direct.west;
			//console.log("----  FEED  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdFriend].data.posX, peopleList[peopleIdFriend].data.posY);
		}
		else if (directRand < directWtWest+directWtEast){
			peopleIdFriend = this.data.pNearList.nrE;
			this.data.feedDir = Direct.east;
			//console.log("----  FEED  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdFriend].data.posX, peopleList[peopleIdFriend].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth){
			peopleIdFriend = this.data.pNearList.nrN;
			this.data.feedDir = Direct.north;
			//console.log("----  FEED  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdFriend].data.posX, peopleList[peopleIdFriend].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth+directWtSouth){
			peopleIdFriend = this.data.pNearList.nrS;
			this.data.feedDir = Direct.south;
			//console.log("----  FEED  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdFriend].data.posX, peopleList[peopleIdFriend].data.posY);
		}
		
		return peopleIdFriend;		
	}
	
	combat(peopleIdE){
		var peopleIdEnemy = peopleIdE;
		//根据战斗值生成随机数，比较随机数决定结果
		var attackThis = getRandom(0, this.data.power);
		var attackEnemy = getRandom(0, peopleList[peopleIdEnemy].data.power);
		
		//console.log(this);
		//console.log(peopleList[peopleIdEnemy]);
		//console.log(attackThis, attackEnemy)
		
		if (attackThis >= attackEnemy){
			//记录比赛结果
			this.data.cbtCt += 1;
			this.data.cbtWn += 1;
			peopleList[peopleIdEnemy].data.cbtCt += 1;
			//胜者从败者随机得到食物
			var resTransfer = getRandom(Math.min(PeopleResCt.dying,peopleList[peopleIdEnemy].data.resCt), 1+Math.min(PeopleResCt.max-this.data.resCt, peopleList[peopleIdEnemy].data.resCt));
			this.data.resCt += resTransfer;
			this.data.resCombat += resTransfer;
			peopleList[peopleIdEnemy].data.resCt -= resTransfer;
			peopleList[peopleIdEnemy].data.resCombat -= resTransfer;
			//console.log("----  WIN   ----");
			//console.log(resTransfer);
		}
		else {
			//记录比赛结果
			this.data.cbtCt += 1;
			peopleList[peopleIdEnemy].data.cbtCt += 1;
			peopleList[peopleIdEnemy].data.cbtWn += 1;
			//胜者从败者随机得到食物
			var resTransfer = getRandom(Math.min(PeopleResCt.dying, this.data.resCt), 1+Math.min(PeopleResCt.max-peopleList[peopleIdEnemy].data.resCt, this.data.resCt));
			this.data.resCt -= resTransfer;
			this.data.resCombat -= resTransfer;			
			peopleList[peopleIdEnemy].data.resCt += resTransfer;
			peopleList[peopleIdEnemy].data.resCombat += resTransfer;
			//console.log("----  LOSE  ----");
			//console.log(resTransfer);
		}
		
		glbData.combatMain += 1;
	}
	
	feed(peopleIdF){
		var peopleIdFriend = peopleIdF;
		
		var resTransfer = Math.min(this.data.resCt-PeopleResCt.starve, PeopleResCt.starve-peopleList[peopleIdFriend].data.resCt);
		this.data.resCt -= resTransfer; 
		peopleList[peopleIdFriend].data.resCt += resTransfer;	
	}
		
	update(){
		//偶尔出现城市消失但人还在的bug，强制人死亡
		if (cityList[this.data.cId] == null){
			this.dead();
		}
		
		this.upgrade();
		
		var acted = 0;	//本回合是否行动过（移动，战斗，挖矿，转移矿才算行动）
		this.near();
		var peopleIdFriend = this.getFriend();
		var peopleIdEnemy = this.getEnemy();

		if (acted == 0 && peopleIdFriend != PeopleId.none && this.data.starve == PeopleStarve.no && peopleList[peopleIdFriend].data.resCt < PeopleResCt.dying)	//有队友并且处于濒死
		{
			this.feed(peopleIdFriend);
			acted = 1;
		}
		else {
			this.data.feedDir = Direct.none;
		}
		
		if (acted == 0 && peopleIdEnemy != PeopleId.none && (this.data.resCt < PeopleResCt.standard || (this.data.resCt < PeopleResCt.enough && mapMain.data.cells[peopleList[peopleIdEnemy].data.posX][peopleList[peopleIdEnemy].data.posY].cCult == this.data.cCult)) && this.data.power > peopleList[peopleIdEnemy].data.power){	//有敌人且觉得打得过（自己饥饿或者在自己境内）
			this.combat(peopleIdEnemy);
			acted = 1;
		}
		else {
			this.data.cbtDir = Direct.none;
		}
		//单独计算胜率
		if (this.data.cbtCt > 0){																									
			this.data.cbtWR = Math.floor(100*this.data.cbtWn/this.data.cbtCt);
		}
		
		if (acted == 0)	{//没有救济队友或者发动战争
			if(this.data.starve == PeopleStarve.no){	//当处于非饥饿状态时
				if (this.data.resCt > PeopleResCt.standard) {	//食物超过储存值时，主动把食物送回部落
					if (Math.abs(this.data.posX - cityList[this.data.cId].data.posX) <= cityList[this.data.cId].data.citySize && Math.abs(this.data.posY - cityList[this.data.cId].data.posY) <= cityList[this.data.cId].data.citySize) {
						var resUpload = this.data.resCt - PeopleResCt.standard;
						this.data.resCt -= resUpload;
						cityList[this.data.cId].data.resCt += resUpload;
						//保存采集位置到城市list里
						if (this.data.resCell.posX != -1 && this.data.resCell.posY != -1) {
							var resCellList = cityList[this.data.cId].data.resCellList;
							resCellList.push({'posX':this.data.resCell.posX, 'posY':this.data.resCell.posY});
							if (resCellList.length > 10) {	//list太长了就删掉旧的
								resCellList.shift();
							}
						}
					}
					else{
						this.go(cityList[this.data.cId].data.posX, cityList[this.data.cId].data.posY);
					}
				}
				else if (this.data.resCt > PeopleResCt.starve){	//食物充足不饥饿时，探索
					this.explore();
				}
				else {	//食物不足时，标记饥饿状态
					this.data.starve = PeopleStarve.yes;
					this.explore();
				}
			}
			else {	//当处于饥饿状态时
				if (this.data.resCt < PeopleResCt.dying) {
					if (Math.abs(this.data.posX - cityList[this.data.cId].data.posX) <= cityList[this.data.cId].data.citySize && Math.abs(this.data.posY - cityList[this.data.cId].data.posY) <= cityList[this.data.cId].data.citySize) {
						var resDownload = Math.min(PeopleResCt.standard - this.data.resCt, cityList[this.data.cId].data.resCt);
						this.data.resCt += resDownload;
						this.data.starve = PeopleStarve.no;
						cityList[this.data.cId].data.resCt -= resDownload;
					}
					else{
						this.go(cityList[this.data.cId].data.posX, cityList[this.data.cId].data.posY);
					}
				}
				else if (this.data.resCt < PeopleResCt.enough) {
					//if (mapMain.data.cells[this.data.posX][this.data.posY].resCt != ResCount.none){	//当前格有食物，直接开采
					if (mapMain.data.cells[this.data.posX][this.data.posY].resCt >= (this.data.collect + ResCount.none)/2){	//当前格有超过半次采集量的食物，直接开采
						this.collect();
					}
					else if (this.data.resCell.posX >=0 && this.data.resCell.posY >=0 && (this.data.resCell.posX != this.data.posX || this.data.resCell.posY != this.data.posY)) {	//当前格没有食物，向记忆中上一个有食物的格子移动
						this.go(this.data.resCell.posX, this.data.resCell.posY);
					}
					else {	//记忆中的格子也没有食物，只能重新探索
						this.explore();
					}
				}
				else {	//食物充足，标记非饥饿状态
					this.data.starve = PeopleStarve.no;
					this.explore();
				}
			}
			acted = 1;
		}
		this.consume();
		
		this.grow();
	}
}
