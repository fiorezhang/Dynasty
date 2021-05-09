class Map{
	//生成空白地图
	constructor(size){
		this.data = {'cellSize': 0, 'cells': null, 'dayCityNext':DayCity};
		this.data.dayCityNext = getRandom(DayCity/2, DayCity*3/2);
		this.data.cellSize = size;
		this.data.cells = new Array();
		for (var i=0; i<size; i++){
			this.data.cells[i] = new Array();
			for (var j=0; j<size; j++){
				this.data.cells[i][j] = {'ter':Terrain.none, 'resTp':ResType.none, 'resCt':ResCount.none, 'cBase':CityBase.none, 'cCult':CityCult.none, 'cId':CityId.none, 'pId':PeopleId.none, 'rdW':Rdcount.none, 'rdE':Rdcount.none, 'rdN':Rdcount.none, 'rdS':Rdcount.none};
			}
		}
	}

	//初始化不可行走cell，根据后面的迭代算法，这里的初始变量ratio十分敏感：0.5及以上时容易形成”岛屿“，0.4及以下时容易形成大块连通的”陆地“，0.45左右会生成大量”湖泊“的”大岛“
	initWater(ratioWater){
		var size = this.data.cellSize;
		for (var i=0; i<size; i++){
			for (var j=0; j<size; j++){
				this.data.cells[i][j].ter = (Math.random()<ratioWater)?Terrain.water:Terrain.none;
			}
		}
		for (var i=0; i<size; i++){
			this.data.cells[i][0].ter = Terrain.water;
			this.data.cells[i][size - 1].ter = Terrain.water;
		}
		for (var j=0; j<size; j++){
			this.data.cells[0][j].ter = Terrain.water;
			this.data.cells[size - 1][j].ter = Terrain.water;
		}
	}
	
	//原胞机方法迭代生成地图，每当一个cell周围及自身”水域“(Water)的数量大于等于5时，下一回合该cell变成或维持”水域“，否则清空成”陆地“
	iterWater(){
		var size = this.data.cellSize;
		this.data.cellsNew = new Array();
		for (var i=0; i<size; i++){
			this.data.cellsNew[i] = new Array();
			for (var j=0; j<size; j++){
				this.data.cellsNew[i][j] = {'ter':Terrain.none};
			}
		}		
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				var sum = 0;
				for (var k=Math.max(0, i-1); k<Math.min(size, i+2); k++){
					for (var l=Math.max(0, j-1); l<Math.min(size, j+2); l++){
						sum += this.data.cells[k][l].ter;
					}
				}
				//sum -= this.data.cells[i][j].ter;
				if (sum >= 5){
					this.data.cellsNew[i][j].ter = Terrain.water; 
				}
			}
		}
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				this.data.cells[i][j].ter = this.data.cellsNew[i][j].ter;
			}
		}
		this.data.cellsNew = null;
	}
	
	//初始化矿区
	initResource(ratioResource){
		var size = this.data.cellSize;
		for (var i=0; i<size; i++){
			for (var j=0; j<size; j++){
				this.data.cells[i][j].resTp = (this.data.cells[i][j].ter==Terrain.none && Math.random()<ratioResource)?ResType.food:ResType.none;
			}
		}
	}
	
	//原胞机方法迭代生成矿区
	iterResource(){
		var size = this.data.cellSize;
		this.data.cellsNew = new Array();
		for (var i=0; i<size; i++){
			this.data.cellsNew[i] = new Array();
			for (var j=0; j<size; j++){
				this.data.cellsNew[i][j] = {'resTp':ResType.none};
			}
		}		
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				var sum = 0;
				for (var k=Math.max(0, i-1); k<Math.min(size, i+2); k++){
					for (var l=Math.max(0, j-1); l<Math.min(size, j+2); l++){
						sum += this.data.cells[k][l].resTp;
					}
				}
				//sum -= this.data.cells[i][j].ter;
				if (this.data.cells[i][j].ter == 0 && sum >= 5){
					this.data.cellsNew[i][j].resTp = ResType.food; 
				}
			}
		}
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				this.data.cells[i][j].resTp = this.data.cellsNew[i][j].resTp;
			}
		}		
		this.data.cellsNew = null;
	}
	
	//给每个矿区生成初始矿储量
	initRescount(){
		var size = this.data.cellSize;
		for (var i=0; i<size; i++){
			for (var j=0; j<size; j++){
				this.data.cells[i][j].resCt = (this.data.cells[i][j].resTp == ResType.food)?ResCount.max:0;
			}
		}
	}

	//初始化地图地形，生成参数非常敏感
	init(){
		this.initWater(MapWaterSeed);
		for (var l=0; l<MapWaterLoop; l++){
			this.iterWater();
		}
		this.initResource(MapResourceSeed);
		for (var l=0; l<MapResourceLoop; l++){
			this.iterResource();
		}
		this.initRescount();
	}
	
	//每日更新
	update(){
		var size = this.data.cellSize;
		//更新资源
		if (glbData.dayMain % DayResReborn == 0){
			for (var i=0; i<size; i++){
				for (var j=0; j<size-1; j++){
					if (this.data.cells[i][j].resTp == ResType.food){
						this.data.cells[i][j].resCt = increase(this.data.cells[i][j].resCt, ResCount.reborn, ResCount.none, ResCount.max);
					}
				}
			}
		}
		//更新道路
		if (glbData.dayMain % DayRoad == 0){	//每隔一段时间就把道路的计数器减一
			for (var i=1; i<size-1; i++){
				for (var j=1; j<size-1; j++){
					this.data.cells[i][j].rdW = decrease(this.data.cells[i][j].rdW, Rdcount.decrease, Rdcount.none, Rdcount.max);
					this.data.cells[i][j].rdE = decrease(this.data.cells[i][j].rdE, Rdcount.decrease, Rdcount.none, Rdcount.max);
					this.data.cells[i][j].rdN = decrease(this.data.cells[i][j].rdN, Rdcount.decrease, Rdcount.none, Rdcount.max);
					this.data.cells[i][j].rdS = decrease(this.data.cells[i][j].rdS, Rdcount.decrease, Rdcount.none, Rdcount.max);
				}
			}
		}
		//更新文化
		if (glbData.dayMain % DayCulture == 0){
			for (var i=1; i<size-1; i++){
				for (var j=0; j<size-1; j++){
					if (this.data.cells[i][j].pId != PeopleId.none && this.data.cells[i][j].resTp == ResType.none) {	//如果有人经过空地
						var people = peopleList[this.data.cells[i][j].pId];
						var city = cityList[people.data.cId];
						var sum = 0;
						for (var k=Math.max(0, i-1); k<Math.min(size, i+2); k++){
							for (var l=Math.max(0, j-1); l<Math.min(size, j+2); l++){
								sum += this.data.cells[k][l].cCult==city.data.cult?1:0;
							}
						}
						if (sum >= 3){
							this.data.cells[i][j].cCult = city.data.cult;
						}
					}
				}
			}			
		}
		//生成新城市
		/* TODO:测试由城市生成新城市
		if (glbData.dayMain >= this.data.dayCityNext && glbData.cAliveList.length < CityNumMax) {
			var city = new City(CitySize.small, CityCult.none);
			if (city.data.id != CityId.none){	//成功生成
				cityList.push(city);
				this.data.dayCityNext = glbData.dayMain + getRandom(DayCity/2, DayCity*3/2);	//随机指定下一个生成市民的天数，平均值为设定的天数
			}	
		}TODO--*/
	}
}