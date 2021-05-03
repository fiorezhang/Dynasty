class People{
	static idStatic = 0;
	
	constructor(cityid, resourceborn){
		this.data = {	'alive':Peoplealive.no, 
						'posX':0, 
						'posY':0, 
						'cityid':cityid, 
						'resource':resourceborn, 
						'collect':0, 
						'recycle':0, 
						'consume':0,
						'rescell':{'posX':-1, 'posY':-1},
						'starve':Peoplestarve.no,
						'power':0, 
						'peopleNearList':{'nearwest':Peopleid.none, 'neareast':Peopleid.none, 'nearnorth':Peopleid.none, 'nearsouth':Peopleid.none}, 
						'age':Peopleage.none,
						'combatcount':0, 
						'combatcountwin':0, 
						'combatrate':null,
						'combatdirect':Direct.none, 
						'feeddirect':Direct.none,
						'id':Peopleid.none, 
						'familyName':'',
						'givenName':'',
						'direct':Direct.none,
						'rescombat':0,
						'rescollect':0,
						'resrecycle':0,
						'resconsume':0,
						};

		if (cityid == Cityid.none){	//专门设计给读档
			People.idStatic += 1;
			return;
		}

		this.data.consume = Peopleconsume.max;	//TODO:应该设计成消耗大于（不等于）回收

		this.data.collect = getRandom(1, Peoplecollect.max);
		this.data.recycle = getRandom(1, Peoplerecycle.max);
		this.data.power = getRandom(1, Peoplepower.max);

		//console.log(this.data.power, this.data.combatcount, this.data.combatcountwin);
		
		//随机生成居民
		var countRetry = 0;		
		var maxRetry = 20;
		var peopleConflict = 0;
		var city = cityList[this.data.cityid];
		do{
			peopleConflict = 0;
			this.data.posX = getRandom(city.data.posX-city.data.citySize, city.data.posX+city.data.citySize+1);
			this.data.posY = getRandom(city.data.posY-city.data.citySize, city.data.posY+city.data.citySize+1);
			//console.log(this.data.posX);
			//console.log(this.data.posY);

			if (mapMain.data.cells[this.data.posX][this.data.posY].peopleid != Peopleid.none || mapMain.data.cells[this.data.posX][this.data.posY].citybase == Citybase.center){
				peopleConflict = 1;
			}
			countRetry += 1;
		}while(peopleConflict == 1 && countRetry < maxRetry);		
		
		//console.log(countRetry, this.data.posX, this.data.posY);
		
		if (countRetry >= maxRetry){
			this.data.id = Peopleid.none;
			return;
		}		
		
		this.data.alive = Peoplealive.yes;
		this.data.id = People.idStatic;
		People.idStatic += 1;
		this.data.familyName = cityList[this.data.cityid].data.familyName;
		this.data.givenName = getGivenName();
		
		//从城市信息获取资源格位置
		var rescelllist = cityList[this.data.cityid].data.rescelllist;
		if (rescelllist != null && rescelllist.length > 0) {
			var rescell = rescelllist[getRandom(0, rescelllist.length)];
			this.data.rescell.posX = rescell.posX;
			this.data.rescell.posY = rescell.posY;
		}
		
		mapMain.data.cells[this.data.posX][this.data.posY].peopleid = this.data.id;
		cityList[this.data.cityid].data.peoplealivelist.push(this.data.id);
		globalData.peoplealivelist.push(this.data.id);
	}
	

	move(weightWest, weightEast, weightNorth, weightSouth){
		var countRetry = 0;		
		var maxRetry = 20;
		var moveConflict = 0;
		var tempPosX = 0;
		var tempPosY = 0;
		do{
			moveConflict = 0;
			tempPosX = this.data.posX;
			tempPosY = this.data.posY;
			var direct = Direct.none;
			var directWtWest = weightWest;
			var directWtEast = weightEast;
			var directWtNorth = weightNorth;
			var directWtSouth = weightSouth;
			var directRand = getRandom(0, directWtWest+directWtEast+directWtNorth+directWtSouth); //加权方式，求出最大权重和各个方向的权重
			if (directRand < directWtWest){
				direct = Direct.west;
				tempPosX -= 1;
				//console.log("WEST");
			}
			else if (directRand < directWtWest+directWtEast){
				direct = Direct.east;
				tempPosX += 1;
				//console.log("EAST");
			}
			else if (directRand < directWtWest+directWtEast+directWtNorth){
				direct = Direct.north;
				tempPosY -= 1;
				//console.log("NORTH");
			}
			else if (directRand < directWtWest+directWtEast+directWtNorth+directWtSouth){
				direct = Direct.south;
				tempPosY += 1;
				//console.log("SOUTH");
			}
			
			if (mapMain.data.cells[tempPosX][tempPosY].terrain == Terrain.water || mapMain.data.cells[tempPosX][tempPosY].peopleid != Peopleid.none){
				moveConflict = 1;
				//console.log("water or people");
			}
			else if (mapMain.data.cells[tempPosX][tempPosY].cityid > Cityid.none){
				if (mapMain.data.cells[tempPosX][tempPosY].cityid != this.data.cityid){	//当碰撞检测到别的城市时
					moveConflict = 1;
					//console.log("other city");
				}
				else if(mapMain.data.cells[tempPosX][tempPosY].citybase == Citybase.center){	//当碰撞检测到本方城市中心时
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
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].roadwest, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].roadwest = roadCount;
			mapMain.data.cells[tempPosX][tempPosY].roadeast = roadCount;
		}
		else if (direct == Direct.east){
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].roadeast, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].roadeast = roadCount;
			mapMain.data.cells[tempPosX][tempPosY].roadwest = roadCount;
		}
		else if (direct == Direct.north){
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].roadnorth, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].roadnorth = roadCount;
			mapMain.data.cells[tempPosX][tempPosY].roadsouth = roadCount;
		}
		else if (direct == Direct.south){
			roadCount = increase(mapMain.data.cells[this.data.posX][this.data.posY].roadsouth, Rdcount.increase, Rdcount.none, Rdcount.max);
			mapMain.data.cells[this.data.posX][this.data.posY].roadsouth = roadCount;
			mapMain.data.cells[tempPosX][tempPosY].roadnorth = roadCount;
		}
		
		this.data.direct = direct;
		mapMain.data.cells[this.data.posX][this.data.posY].peopleid = Peopleid.none;	//从旧单元格清除当前人物id
		this.data.posX = tempPosX;
		this.data.posY = tempPosY;
		mapMain.data.cells[this.data.posX][this.data.posY].peopleid = this.data.id;	//向新的单元格写入当前人物id
		
		//记录新单元格信息，例如是否有食物
		if (mapMain.data.cells[this.data.posX][this.data.posY].rescount != Rescount.none){
			this.data.rescell.posX = this.data.posX;
			this.data.rescell.posY = this.data.posY;
		}
	}

	explore(){
		//随机生成方向，来时的方向尽可能避免，权重值设为最小，走过的路尽量避免
		var directWtWest = (this.data.direct==Direct.west)?(Rdcount.max*2):((this.data.direct==Direct.east)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].roadwest));
		var directWtEast = (this.data.direct==Direct.east)?(Rdcount.max*2):((this.data.direct==Direct.west)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].roadeast));
		var directWtNorth = (this.data.direct==Direct.north)?(Rdcount.max*2):((this.data.direct==Direct.south)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].roadnorth));
		var directWtSouth = (this.data.direct==Direct.south)?(Rdcount.max*2):((this.data.direct==Direct.north)?1:(Rdcount.max - mapMain.data.cells[this.data.posX][this.data.posY].roadsouth));		

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
		var collectThis = Math.min(mapMain.data.cells[this.data.posX][this.data.posY].rescount, this.data.collect);	//采集能力和该格子剩余量较小值
		collectThis = Math.min(collectThis, Peopleresource.max-this.data.resource);	//前述较小值与储存空间余量较小值
		this.data.resource += collectThis;
		mapMain.data.cells[this.data.posX][this.data.posY].rescount -= collectThis;
		this.data.rescollect += collectThis;
	}
	
	consume(){
		//var resConsume = Math.min(this.data.consume, this.data.resource);
		//仅当不在矿区的时候消耗食物，并且立刻回收一部分食物（不占用行动）
		if (mapMain.data.cells[this.data.posX][this.data.posY].resource != Resource.food) {
			if (mapMain.data.cells[this.data.posX][this.data.posY].cityculture == this.data.cityid) {	//在自己的疆域上
				this.data.consume = Math.max(Peopleconsume.save, this.data.recycle);
			}
			else {
				this.data.consume = Peopleconsume.max;
			}
			this.data.resource -= this.data.consume;
			this.data.resconsume -= this.data.consume;
			this.data.resource += this.data.recycle;
			this.data.resrecycle += this.data.recycle;
		}
		if (this.data.resource <= Peopleresource.none){	//没有食物了，死亡
			this.dead();
		}	
	}
	
	grow(){
		this.data.age += 1;
		if (getRandom(this.data.age, Peopleage.max+1) == Peopleage.max){	//年龄太大了，死亡
			this.dead();
		}			
	}
	
	dead(){
		mapMain.data.cells[this.data.posX][this.data.posY].peopleid = Peopleid.none;
		if (cityList[this.data.cityid] != null) {
			var peoplel = cityList[this.data.cityid].data.peoplealivelist;
			peoplel.splice(peoplel.indexOf(this.data.id), 1);
		}
		var peoplel = globalData.peoplealivelist;
		peoplel.splice(peoplel.indexOf(this.data.id), 1);
		this.data.alive = Peoplealive.no;
	}
	
	near(){
		this.data.peopleNearList.nearwest = mapMain.data.cells[this.data.posX-1][this.data.posY].peopleid;
		this.data.peopleNearList.neareast = mapMain.data.cells[this.data.posX+1][this.data.posY].peopleid;
		this.data.peopleNearList.nearnorth = mapMain.data.cells[this.data.posX][this.data.posY-1].peopleid;
		this.data.peopleNearList.nearsouth = mapMain.data.cells[this.data.posX][this.data.posY+1].peopleid;
	}

	getEnemy(){
		this.data.combatdirect = Direct.none;
		var peopleIdEnemy = Peopleid.none;
		
		var directWtWest = (this.data.peopleNearList.nearwest!=Peopleid.none && peopleList[this.data.peopleNearList.nearwest].data.cityid != this.data.cityid)?1:0;
		var directWtEast = (this.data.peopleNearList.neareast!=Peopleid.none && peopleList[this.data.peopleNearList.neareast].data.cityid != this.data.cityid)?1:0;
		var directWtNorth = (this.data.peopleNearList.nearnorth!=Peopleid.none && peopleList[this.data.peopleNearList.nearnorth].data.cityid != this.data.cityid)?1:0;
		var directWtSouth = (this.data.peopleNearList.nearsouth!=Peopleid.none && peopleList[this.data.peopleNearList.nearsouth].data.cityid != this.data.cityid)?1:0;
		
		var directRand = getRandom(0, directWtWest+directWtEast+directWtNorth+directWtSouth); //加权方式，求出最大权重和各个方向的权重
		if (directRand < directWtWest){
			peopleIdEnemy = this.data.peopleNearList.nearwest;
			this.data.combatdirect = Direct.west;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		else if (directRand < directWtWest+directWtEast){
			peopleIdEnemy = this.data.peopleNearList.neareast;
			this.data.combatdirect = Direct.east;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth){
			peopleIdEnemy = this.data.peopleNearList.nearnorth;
			this.data.combatdirect = Direct.north;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth+directWtSouth){
			peopleIdEnemy = this.data.peopleNearList.nearsouth;
			this.data.combatdirect = Direct.south;
			//console.log("----  COMBAT  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdEnemy].data.posX, peopleList[peopleIdEnemy].data.posY);
		}
		
		return peopleIdEnemy;
	}
	
	getFriend(){
		this.data.feeddirect = Direct.none;
		var peopleIdFriend = Peopleid.none;
		
		var directWtWest = (this.data.peopleNearList.nearwest!=Peopleid.none && peopleList[this.data.peopleNearList.nearwest].data.cityid == this.data.cityid)?1:0;
		var directWtEast = (this.data.peopleNearList.neareast!=Peopleid.none && peopleList[this.data.peopleNearList.neareast].data.cityid == this.data.cityid)?1:0;
		var directWtNorth = (this.data.peopleNearList.nearnorth!=Peopleid.none && peopleList[this.data.peopleNearList.nearnorth].data.cityid == this.data.cityid)?1:0;
		var directWtSouth = (this.data.peopleNearList.nearsouth!=Peopleid.none && peopleList[this.data.peopleNearList.nearsouth].data.cityid == this.data.cityid)?1:0;
		
		var directRand = getRandom(0, directWtWest+directWtEast+directWtNorth+directWtSouth); //加权方式，求出最大权重和各个方向的权重
		if (directRand < directWtWest){
			peopleIdFriend = this.data.peopleNearList.nearwest;
			this.data.feeddirect = Direct.west;
			//console.log("----  FEED  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdFriend].data.posX, peopleList[peopleIdFriend].data.posY);
		}
		else if (directRand < directWtWest+directWtEast){
			peopleIdFriend = this.data.peopleNearList.neareast;
			this.data.feeddirect = Direct.east;
			//console.log("----  FEED  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdFriend].data.posX, peopleList[peopleIdFriend].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth){
			peopleIdFriend = this.data.peopleNearList.nearnorth;
			this.data.feeddirect = Direct.north;
			//console.log("----  FEED  ----");
			//console.log(this.data.posX, this.data.posY, peopleList[peopleIdFriend].data.posX, peopleList[peopleIdFriend].data.posY);
		}
		else if (directRand < directWtWest+directWtEast+directWtNorth+directWtSouth){
			peopleIdFriend = this.data.peopleNearList.nearsouth;
			this.data.feeddirect = Direct.south;
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
			this.data.combatcount += 1;
			this.data.combatcountwin += 1;
			peopleList[peopleIdEnemy].data.combatcount += 1;
			//胜者从败者随机得到食物
			var resTransfer = getRandom(Math.min(Peopleresource.dying,peopleList[peopleIdEnemy].data.resource), 1+Math.min(Peopleresource.max-this.data.resource, peopleList[peopleIdEnemy].data.resource));
			this.data.resource += resTransfer;
			this.data.rescombat += resTransfer;
			peopleList[peopleIdEnemy].data.resource -= resTransfer;
			peopleList[peopleIdEnemy].data.rescombat -= resTransfer;
			//console.log("----  WIN   ----");
			//console.log(resTransfer);
		}
		else {
			//记录比赛结果
			this.data.combatcount += 1;
			peopleList[peopleIdEnemy].data.combatcount += 1;
			peopleList[peopleIdEnemy].data.combatcountwin += 1;
			//胜者从败者随机得到食物
			var resTransfer = getRandom(Math.min(Peopleresource.dying, this.data.resource), 1+Math.min(Peopleresource.max-peopleList[peopleIdEnemy].data.resource, this.data.resource));
			this.data.resource -= resTransfer;
			this.data.rescombat -= resTransfer;			
			peopleList[peopleIdEnemy].data.resource += resTransfer;
			peopleList[peopleIdEnemy].data.rescombat += resTransfer;
			//console.log("----  LOSE  ----");
			//console.log(resTransfer);
		}
		
		globalData.combatMain += 1;
	}
	
	feed(peopleIdF){
		var peopleIdFriend = peopleIdF;
		
		var resTransfer = Math.min(this.data.resource-Peopleresource.starve, Peopleresource.starve-peopleList[peopleIdFriend].data.resource);
		this.data.resource -= resTransfer; 
		peopleList[peopleIdFriend].data.resource += resTransfer;	
	}
		
	update(day){
		//偶尔出现城市消失但人还在的bug，强制人死亡
		if (cityList[this.data.cityid] == null){
			this.dead();
		}
		
		var acted = 0;	//本回合是否行动过（移动，战斗，挖矿，转移矿才算行动）
		this.near();
		var peopleIdFriend = this.getFriend();
		var peopleIdEnemy = this.getEnemy();

		if (acted == 0 && peopleIdFriend != Peopleid.none && this.data.starve == Peoplestarve.no && peopleList[peopleIdFriend].data.resource < Peopleresource.dying)	//有队友并且处于濒死
		{
			this.feed(peopleIdFriend);
			acted = 1;
		}
		else {
			this.data.feeddirect = Direct.none;
		}
		
		if (acted == 0 && peopleIdEnemy != Peopleid.none && this.data.resource < Peopleresource.starve && this.data.power > peopleList[peopleIdEnemy].data.power){	//有敌人且觉得打得过
			this.combat(peopleIdEnemy);
			acted = 1;
		}
		else {
			this.data.combatdirect = Direct.none;
		}
		//单独计算胜率
		if (this.data.combatcount > 0){																									
			this.data.combatrate = Math.floor(100*this.data.combatcountwin/this.data.combatcount);
		}
		
		if (acted == 0)	{//没有救济队友或者发动战争
			if(this.data.starve == Peoplestarve.no){	//当处于非饥饿状态时
				if (this.data.resource > Peopleresource.standard) {	//食物超过储存值时，主动把食物送回部落
					if (Math.abs(this.data.posX - cityList[this.data.cityid].data.posX) <= cityList[this.data.cityid].data.citySize && Math.abs(this.data.posY - cityList[this.data.cityid].data.posY) <= cityList[this.data.cityid].data.citySize) {
						var resUpload = this.data.resource - Peopleresource.standard;
						this.data.resource -= resUpload;
						cityList[this.data.cityid].data.resource += resUpload;
						//保存采集位置到城市list里
						if (this.data.rescell.posX != -1 && this.data.rescell.posY != -1) {
							var rescelllist = cityList[this.data.cityid].data.rescelllist;
							rescelllist.push({'posX':this.data.rescell.posX, 'posY':this.data.rescell.posY});
							if (rescelllist.length > 10) {	//list太长了就删掉旧的
								rescelllist.shift();
							}
						}
					}
					else{
						this.go(cityList[this.data.cityid].data.posX, cityList[this.data.cityid].data.posY);
					}
				}
				else if (this.data.resource > Peopleresource.starve){	//食物充足不饥饿时，探索
					this.explore();
				}
				else {	//食物不足时，标记饥饿状态
					this.data.starve = Peoplestarve.yes;
					this.explore();
				}
			}
			else {	//当处于饥饿状态时
				if (this.data.resource < Peopleresource.dying) {
					if (Math.abs(this.data.posX - cityList[this.data.cityid].data.posX) <= cityList[this.data.cityid].data.citySize && Math.abs(this.data.posY - cityList[this.data.cityid].data.posY) <= cityList[this.data.cityid].data.citySize) {
						var resDownload = Math.min(Peopleresource.standard - this.data.resource, cityList[this.data.cityid].data.resource);
						this.data.resource += resDownload;
						this.data.starve = Peoplestarve.no;
						cityList[this.data.cityid].data.resource -= resDownload;
					}
					else{
						this.go(cityList[this.data.cityid].data.posX, cityList[this.data.cityid].data.posY);
					}
				}
				else if (this.data.resource < Peopleresource.enough) {
					if (mapMain.data.cells[this.data.posX][this.data.posY].rescount != Rescount.none){	//当前格有食物，直接开采
						this.collect();
					}
					else if (this.data.rescell.posX >=0 && this.data.rescell.posY >=0 && (this.data.rescell.posX != this.data.posX || this.data.rescell.posY != this.data.posY)) {	//当前格没有食物，向记忆中上一个有食物的格子移动
						this.go(this.data.rescell.posX, this.data.rescell.posY);
					}
					else {	//记忆中的格子也没有食物，只能重新探索
						this.explore();
					}
				}
				else {	//食物充足，标记非饥饿状态
					this.data.starve = Peoplestarve.no;
					this.explore();
				}
			}
			acted = 1;
		}
		this.consume();
		
		this.grow();
	}
}
