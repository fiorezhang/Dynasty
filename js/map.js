class Map{
	//生成空白地图
	constructor(size){
		this.data = {'cellSize': 0, 'cells': null, 'dayNext':Daycity};
		this.data.dayNext = Math.round(getRandom(1, Daycity*2)/10);
		this.data.cellSize = size;
		this.data.cells = new Array();
		for (var i=0; i<size; i++){
			this.data.cells[i] = new Array();
			for (var j=0; j<size; j++){
				this.data.cells[i][j] = {'terrain':Terrain.none, 'resource':Resource.none, 'rescount':Rescount.none, 'citybase':Citybase.none, 'cityculture':Cityid.none, 'cityid':Cityid.none, 'peopleid':Peopleid.none, 'roadwest':Rdcount.none, 'roadeast':Rdcount.none, 'roadnorth':Rdcount.none, 'roadsouth':Rdcount.none};
			}
		}
	}

	//初始化不可行走cell，根据后面的迭代算法，这里的初始变量ratio十分敏感：0.5及以上时容易形成”岛屿“，0.4及以下时容易形成大块连通的”陆地“，0.45左右会生成大量”湖泊“的”大岛“
	initWater(ratioWater){
		var size = this.data.cellSize;
		for (var i=0; i<size; i++){
			for (var j=0; j<size; j++){
				this.data.cells[i][j].terrain = (Math.random()<ratioWater)?Terrain.water:Terrain.none;
			}
		}
		for (var i=0; i<size; i++){
			this.data.cells[i][0].terrain = Terrain.water;
			this.data.cells[i][size - 1].terrain = Terrain.water;
		}
		for (var j=0; j<size; j++){
			this.data.cells[0][j].terrain = Terrain.water;
			this.data.cells[size - 1][j].terrain = Terrain.water;
		}
	}
	
	//原胞机方法迭代生成地图，每当一个cell周围及自身”水域“(Water)的数量大于等于5时，下一回合该cell变成或维持”水域“，否则清空成”陆地“
	iterWater(){
		var size = this.data.cellSize;
		this.data.cellsNew = new Array();
		for (var i=0; i<size; i++){
			this.data.cellsNew[i] = new Array();
			for (var j=0; j<size; j++){
				this.data.cellsNew[i][j] = {'terrain':Terrain.none};
			}
		}		
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				var sum = 0;
				for (var k=Math.max(0, i-1); k<Math.min(size, i+2); k++){
					for (var l=Math.max(0, j-1); l<Math.min(size, j+2); l++){
						sum += this.data.cells[k][l].terrain;
					}
				}
				//sum -= this.data.cells[i][j].terrain;
				if (sum >= 5){
					this.data.cellsNew[i][j].terrain = Terrain.water; 
				}
			}
		}
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				this.data.cells[i][j].terrain = this.data.cellsNew[i][j].terrain;
			}
		}
		this.data.cellsNew = null;
	}
	
	//初始化矿区
	initResource(ratioResource){
		var size = this.data.cellSize;
		for (var i=0; i<size; i++){
			for (var j=0; j<size; j++){
				this.data.cells[i][j].resource = (this.data.cells[i][j].terrain==Terrain.none && Math.random()<ratioResource)?Resource.food:Resource.none;
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
				this.data.cellsNew[i][j] = {'resource':Resource.none};
			}
		}		
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				var sum = 0;
				for (var k=Math.max(0, i-1); k<Math.min(size, i+2); k++){
					for (var l=Math.max(0, j-1); l<Math.min(size, j+2); l++){
						sum += this.data.cells[k][l].resource;
					}
				}
				//sum -= this.data.cells[i][j].terrain;
				if (this.data.cells[i][j].terrain == 0 && sum >= 5){
					this.data.cellsNew[i][j].resource = Resource.food; 
				}
			}
		}
		for (var i=1; i<size-1; i++){
			for (var j=1; j<size-1; j++){
				this.data.cells[i][j].resource = this.data.cellsNew[i][j].resource;
			}
		}		
		this.data.cellsNew = null;
	}
	
	//给每个矿区生成初始矿储量
	initRescount(){
		var size = this.data.cellSize;
		for (var i=0; i<size; i++){
			for (var j=0; j<size; j++){
				this.data.cells[i][j].rescount = (this.data.cells[i][j].resource == Resource.food)?Rescount.max:0;
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
	update(day){
		var size = this.data.cellSize;
		//更新资源
		if (day % Dayfoodreborn == 0){
			for (var i=0; i<size; i++){
				for (var j=0; j<size-1; j++){
					if (this.data.cells[i][j].resource == Resource.food){
						this.data.cells[i][j].rescount = increase(this.data.cells[i][j].rescount, Rescount.reborn, Rescount.none, Rescount.max);
					}
				}
			}
		}
		//更新道路
		if (day % Dayroad == 0){	//每隔一段时间就把道路的计数器减一
			for (var i=1; i<size-1; i++){
				for (var j=1; j<size-1; j++){
					this.data.cells[i][j].roadwest = decrease(this.data.cells[i][j].roadwest, Rdcount.decrease, Rdcount.none, Rdcount.max);
					this.data.cells[i][j].roadeast = decrease(this.data.cells[i][j].roadeast, Rdcount.decrease, Rdcount.none, Rdcount.max);
					this.data.cells[i][j].roadnorth = decrease(this.data.cells[i][j].roadnorth, Rdcount.decrease, Rdcount.none, Rdcount.max);
					this.data.cells[i][j].roadsouth = decrease(this.data.cells[i][j].roadsouth, Rdcount.decrease, Rdcount.none, Rdcount.max);
				}
			}
		}
		//更新文化
		if (day % Dayculture == 0){
			for (var i=1; i<size-1; i++){
				for (var j=0; j<size-1; j++){
					if (this.data.cells[i][j].peopleid != Peopleid.none && this.data.cells[i][j].resource == Resource.none) {	//如果有人经过空地
						var people = peopleList[this.data.cells[i][j].peopleid];
						var city = cityList[people.data.cityid];
						var sum = 0;
						for (var k=Math.max(0, i-1); k<Math.min(size, i+2); k++){
							for (var l=Math.max(0, j-1); l<Math.min(size, j+2); l++){
								sum += this.data.cells[k][l].cityculture==city.data.id?1:0;
							}
						}
						if (sum >= 3){
							this.data.cells[i][j].cityculture = city.data.id;
						}
					}
				}
			}			
		}
		//生成新城市
		if (day >= this.data.dayNext && globalData.cityalivelist.length < CityNumMax) {
			var city = new City(Citysize.small);
			if (city.data.id != Cityid.none){	//成功生成
				cityList.push(city);
				this.data.dayNext = day + getRandom(1, Daycity*2);	//随机指定下一个生成市民的天数，平均值为设定的天数
			}	
		}
	}
}