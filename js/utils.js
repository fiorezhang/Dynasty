function increase(value, step, min, max){
	var temp = value;
	temp += step;
	if (temp >= max){
		temp = max;
	}
	return temp;
}

function decrease(value, step, min, max){
	var temp = value;
	temp -= step;
	if (temp <= min){
		temp = min;
	}
	return temp;
}

//随机生成m到n-1整数
function getRandom(m, n){
	return Math.floor(Math.random()*(n-m)+m);
}

//根据输入的种子生成随机数
function getSeededRandom(m, n, seed){
    max = n || 1;
    min = m || 0;
 
    var temp = (seed * 9301 + 49297) % 233280;
    var rnd = temp / 233280.0;
 
    return Math.round( min + rnd * (max - min) );   // Math.round实现取整功能,可以根据需要取消取整
 };

function getRandomColor(m, n){
    return '#'+getRandom(m, n).toString(16)+getRandom(m, n).toString(16)+getRandom(m, n).toString(16);
}

function getSeededRandomColor(m, n, seed){
	var r = getSeededRandom(m, n, seed)&255;
	var g = getSeededRandom(m, n, r)&255;
	var b = getSeededRandom(m, n, g)&255;
	return '#'+r.toString(16)+g.toString(16)+b.toString(16);
}

function unique(arr) {
  return Array.from(new Set(arr))
}

//存档
function save(){
	var savedgame = {
		global: globalData, 
		map: mapMain, 
		cityl: cityList, 
		peoplel: peopleList, 
	}
	console.log(JSON.stringify(savedgame));
	localStorage.setItem("dynasty", JSON.stringify(savedgame));
}

//读档
function load(){
	console.log(localStorage.getItem("save"));
	var savedgame = JSON.parse(localStorage.getItem("dynasty"));
	if (savedgame != null && savedgame != undefined){
		globalData = savedgame.global;
		
		City.idStatic = 0;
		cityList = new Array();
		for (var i=0; i<savedgame.cityl.length; i++){
			var city = new City(Citysize.none);
			if (savedgame.cityl[i] != null) {
				city.data = savedgame.cityl[i].data;
			}
			cityList.push(city);
		}

		People.idStatic = 0;
		peopleList = new Array();
		for (var i=0; i<savedgame.peoplel.length; i++){
			var people = new People(Cityid.none);
			if (savedgame.peoplel[i] != null) {
				people.data = savedgame.peoplel[i].data;
			}
			peopleList.push(people);
		}

		mapMain.data = savedgame.map.data;
	}
}

function getFamilyName() {
	var familyNames = new Array(
	'赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤', '许',
	'何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏', '陶', '姜', '戚', '谢', '邹', '喻', '柏', '水', '窦', '章',
	'云', '苏', '潘', '葛', '奚', '范', '彭', '郎', '鲁', '韦', '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳',
	'酆', '鲍', '史', '唐', '费', '廉', '岑', '薛', '雷', '贺', '倪', '汤', '滕', '殷', '罗', '毕', '郝', '邬', '安', '常',
	'乐', '于', '时', '傅', '皮', '卞', '齐', '康', '伍', '余', '元', '卜', '顾', '孟', '平', '黄', '和', '穆', '萧', '尹',
	'姚', '邵', '堪', '汪', '祁', '毛', '禹', '狄', '米', '贝', '明', '臧', '计', '伏', '成', '戴', '谈', '宋', '茅', '庞',
	'熊', '纪', '舒', '屈', '项', '祝', '董', '梁', 
	'公孙', '长孙', '颛孙', '尉迟', '钟离', '宇文', '诸葛', '段干', '独孤', '上官', '司徒', '司马', '司空', '南郭', '西门', 
	'皇甫', '第五',	'轩辕', '慕容', '令狐', '欧阳', '百里', '东郭', '东里', '拓跋', '南宫', '梁丘', '呼延', '鲜于', '夏侯', 
	'左丘', '完颜', '乐羊', '万俟', '东方', '端木', '赫连',
	);
	var index = getRandom(0, familyNames.length);
	return familyNames[index];
}

function getGivenName() {
	var middleNames = new Array(
	'文', '久', '正', '希', '肃', '大', '土', '安', '永', '金', '忠', '辉', '齐', '昌', '立', '孟', '伯', '长', '德', '万', '书', '华', '友', '由', '经', '圣', '发', '又', '继', '明', '会', '章', '修', '水', '载', '达', '子', '祥', '代', '与', '绪', '述', '克', '后', '宏', '才', '良', '清', '民', '为', '旺', '家', '天', '学', '谟', '泽', '基', '贤', '宜', '如', '从', '道', '国', '可', '培', '思', '芳', '吉', '心', '功', '绳', '师', '聪', '官', '诗', '侬', '孝', '积', '荣', '裕', '智', '耀', '绍', '前', '祯', '厚', '衍', '敦', '延', '火', '匡', '廷', '康', '煌', '烈', '龙', '自', '声', '善', '谋', '凤', '显', '恭', '义', '仁', '士', '隆', '哲', '卿', '相', '贻', '武', '礼', '尚', '祖', '恩', '兴', '庆', '作', '誉', '传', '世', '远', '先', '承', '惟', '治', '一', '身', '顺', '令', '启', '存', '训', '木', '宗', '邦', '际', '昭', '信', '睿', '则', '光', '应', '守',
	);
	var lastNames = new Array(
	'秀', '娟', '英', '华', '慧', '巧', '美', '娜', '静', '淑', '惠', '珠', '翠', '雅', '芝', '玉', '萍', '红', '娥', '玲', '芬', '芳', '燕', '彩', '春', '菊', '兰', '凤', '洁', '梅', '琳', '素', '云', '莲', '真', '环', '雪', '荣', '爱', '妹', '霞', '香', '月', '莺', '媛', '艳', '瑞', '凡', '佳', '嘉', '琼', '勤', '珍', '贞', '莉', '桂', '娣', '叶', '璧', '璐', '娅', '琦', '晶', '妍', '茜', '秋', '珊', '莎', '锦', '黛', '青', '倩', '婷', '姣', '婉', '娴', '瑾', '颖', '露', '瑶', '怡', '婵', '雁', '蓓', '纨', '仪', '荷', '丹', '蓉', '眉', '君', '琴', '蕊', '薇', '菁', '梦', '岚', '苑', '婕', '馨', '瑗', '琰', '韵', '融', '园', '艺', '咏', '卿', '聪', '澜', '纯', '毓', '悦', '昭', '冰', '爽', '琬', '茗', '羽', '希', '宁', '欣', '飘', '育', '滢', '馥', '筠', '柔', '竹', '霭', '凝', '晓', '欢', '霄', '枫', '芸', '菲', '寒', '伊', '亚', '宜', '可', '姬', '舒', '影', '荔', '枝', '思', '丽', 
	'伟', '刚', '勇', '毅', '俊', '峰', '强', '军', '平', '保', '东', '文', '辉', '力', '明', '永', '健', '世', '广', '志', '义', '兴', '良', '海', '山', '仁', '波', '宁', '贵', '福', '生', '龙', '元', '全', '国', '胜', '学', '祥', '才', '发', '武', '新', '利', '清', '飞', '彬', '富', '顺', '信', '子', '杰', '涛', '昌', '成', '康', '星', '光', '天', '达', '安', '岩', '中', '茂', '进', '林', '有', '坚', '和', '彪', '博', '诚', '先', '敬', '震', '振', '壮', '会', '思', '群', '豪', '心', '邦', '承', '乐', '绍', '功', '松', '善', '厚', '庆', '磊', '民', '友', '裕', '河', '哲', '江', '超', '浩', '亮', '政', '谦', '亨', '奇', '固', '之', '轮', '翰', '朗', '伯', '宏', '言', '若', '鸣', '朋', '斌', '梁', '栋', '维', '启', '克', '伦', '翔', '旭', '鹏', '泽', '晨', '辰', '士', '以', '建', '家', '致', '树', '炎', '德', '行', '时', '泰', '盛', '雄', '琛', '钧', '冠', '策', '腾', '楠', '榕', '风', '航', '弘', 
	);
	var ifMiddle = getRandom(0, 5);	//产生单名的概率1/n
	var indexMiddle = getRandom(0, middleNames.length);
	var indexLast = getRandom(0, lastNames.length);
	return ifMiddle>0?middleNames[indexMiddle]+lastNames[indexLast]:lastNames[indexLast];
}
