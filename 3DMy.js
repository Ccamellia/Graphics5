//实验2程序(59LYH_3DMy.js)

var colors =[
			 vec3(0.94,0.82,0.97),
			 vec3(0.90,0.44,0.62),
			 vec3(0.59,0.44,0.62),
			 vec3(0.44,0.45,0.62),
			 ]; 
var attributes = [];//存放顶点属性的数组(坐标和颜色交替存),初始为空

var NumTimesToSubdivide = 2; //递归次数
var NumTetrahedrons = Math.pow(4,NumTimesToSubdivide);//产生的四面体个数
var NumTriangles = 4 * NumTetrahedrons;//产生的三角形个数,每个四面体4个三角形 
var NumVertices = 3 * NumTriangles;//顶点数

//----------------------------
//将三角形的顶点属性数据加入数组中
//a,b,c为三角形的三个顶点坐标
//colorIndex为colors数组的索引,
//三个顶点颜色均设为colors[colorIndex]
//顶点坐标和颜色交替存
function triangle(a,b,c,colorIndex){
	attributes.push(a);
	attributes.push(colors[colorIndex]);
	attributes.push(b);
	attributes.push(colors[colorIndex]);
	attributes.push(c);
	attributes.push(colors[colorIndex]);
}

//生成四面体,参数为四面体的4个顶点
function tetra(a,b,c,d){
	triangle(a,b,c,0);//红色三角形
	triangle(a,c,d,1);//绿色三角形
	triangle(a,d,b,2);//蓝色三角形
	triangle(b,d,c,3);//黑色三角形
}

//体细分
//a,b,c,d为四面体的4个顶点,k为递归次数
function divideTetra(a,b,c,d,k){
	//基于顶点的数量对三角形进行细分处理
	var mid = [];
	if(k>0){
		//计算各边的中点
		mid[0]=mult(0.5,add(a,b));
		mid[1]=mult(0.5,add(a,c));
		mid[2]=mult(0.5,add(a,d));
		mid[3]=mult(0.5,add(b,c));
		mid[4]=mult(0.5,add(c,d));
		mid[5]=mult(0.5,add(b,d));
		
		
		//通过细分生成4个四面体
		divideTetra(a,mid[0],mid[1],mid[2],k-1);
		divideTetra(mid[0],b,mid[3],mid[5],k-1);
		divideTetra(mid[1],mid[3],c,mid[4],k-1);
		divideTetra(mid[2],mid[5],mid[4],d,k-1);
		
	}
	else
		tetra(a,b,c,d);//在递归结束时添加四面体顶点数据
}



//页面加载完成后调用此函数，函数名任意（不一定为main）
window.onload = function main()
{
	//获取页面中id为webgl的canvas元素
	var canvas = document.getElementById("webgl");
	if(!canvas)//获取失败？
	{
		alert("获取canvas元素失败！");
		return;
	}
	//利用辅助程序文件中的功能获取WebGL上下文
	//成功则后面可通过gl来调用WebGL的函数
	var gl = WebGLUtils.setupWebGL(canvas);
	if (!gl)//失败则弹出信息
	{
		alert("获取WebGL上下文失败！");
		return;
	}
		
	//指定三角形的三个顶点
	var vertices = [vec3(-0.75,-0.9,-1.0),	//前方中心点
					vec3(-0.75,-0.4,-0.3333),//底面上方点
					vec3(-1.0,-1.0,-0.3333),//底面左下点
					vec3(-0.5,-1.0,-0.3333),//底面右下点
					
					vec3(0.75,0.5,-1.0),//前方中心点
					vec3(0.75,1.0,-0.3333),//底面上方点
					vec3(0.5,0.4,-0.3333),//底面左下点
					vec3(1.0,0.4,-0.3333),//底面右下点
					
					vec3(0.0,0.2,-1.0),//前方中心点
					vec3(-0.3,0.3,-0.3333),//底面上方点
					vec3(-0.3,-0.3,-0.3333),//底面左下点
					vec3(0.3,-0.3,-0.3333),//底面右下点
					
					vec3(0.0,0.2,-1.0),//前方中心点
					vec3(0.3,0.3,-0.3333),//底面上方点
					vec3(-0.3,0.3,-0.3333),//底面左下点
					vec3(0.3,-0.3,-0.3333),//底面右下点
					
					];
		
	//细分原始四面体,生成顶点属性数据
	divideTetra(vertices[0],vertices[1],vertices[2],vertices[3],NumTimesToSubdivide);
	
	divideTetra(vertices[4],vertices[5],vertices[6],vertices[7],NumTimesToSubdivide);

	divideTetra(vertices[8],vertices[9],vertices[10],vertices[11],NumTimesToSubdivide);
	
	divideTetra(vertices[12],vertices[13],vertices[14],vertices[15],NumTimesToSubdivide);
	
	
	//设置WebGL相关属性
	//设置视口（此处视口占满整个canvas）
	gl.viewport(0,//视口左边界距离canvas左边界距离
				0,//视口下边界距离canvas上边界距离
				canvas.width,//视口宽度
				canvas.height);//视口高度
	gl.clearColor(0.0,0.0,0.0,0.0);//设置背景色为白色
	gl.enable(gl.DEPTH_TEST);//开启深度检测
		
	//加载shader程序并为shader中attribute变量提供数据
	//加载id分别为"vertex-shader"和"fragment-shader"的shader程序
	//并进行编译和链接，返回shader程序对象program
	var program = initShaders(gl,"vertex-shader","fragment-shader")	;
	gl.useProgram(program);	//启用该shader程序对象
		
	//将顶点属性数据传输到GPU
	var verticesBufferId = gl.createBuffer();//创建buffer
	//将id为verticesBufferId的buffer绑定为当前Array Buffer
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	//为当前Array Buffer提供数据，传输到GPU
	gl.bufferData(gl.ARRAY_BUFFER,	//Buffer类型
			flatten(attributes),		//Buffer数据来源，flatten将points转换为GPU可接受的格式
			gl.STATIC_DRAW);		//表明将如何使用Buffer（STATIC_DRAW表明是一次提供数据，多遍绘制）
	//数据已经传输到GPU,内存中数据已可清空
	attributes.length=0;
		
	//为shader属性变量与buffer数据建立关联
	//获取名称为"a_Position"的shader attribute变量的位置
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position < 0)//getAttribLocation获取失败则返回-1
	{
		alert("获取attribute变量a_Position失败！");
		return;
	}
		
	//指定利用当前Array Buffer为a_Position提供数据具体方式
	gl.vertexAttribPointer(a_Position,//shader attribute变量位置
		3,			//每个顶点属性有3个分量
		gl.FLOAT,	//数组数据类型（浮点型）
		false,		//不进行归一化处理
		Float32Array.BYTES_PER_ELEMENT * 6,//相邻顶点属性首址间隔
		0);			//第一个顶点属性在Buffer中偏移量为0字节
	gl.enableVertexAttribArray(a_Position);//启用顶点属性数组	
		
	//获取名称为“a_Color”的shader attribute变量的位置
	var a_Color=gl.getAttribLocation(program,"a_Color");
	if(a_Color < 0)//getAttribLocation获取失败则返回-1
	{
		alert("获取attribute变量a_Color失败！");
		return;
	}
		
	//指定利用当前Array Buffer为a_Position提供数据的具体方式
	gl.vertexAttribPointer(a_Color,	//shader attribute变量位置
			3,			//每个顶点属性有3个分量
			gl.FLOAT,	//数组数据类型(浮点型)
			false,		//不进行归一化处理
			Float32Array.BYTES_PER_ELEMENT*6,	//相邻顶点属性首址间隔
			Float32Array.BYTES_PER_ELEMENT*3); 	//第一个顶点属性在Buffer中偏移量
			gl.enableVertexAttribArray(a_Color);//启用顶点属性数组
	
	//进行绘制
	//render(gl);
	
	//实现动画效果
		var iCount = 0;
		var tick = function()
		{
			if(iCount < NumVertices * 4) 
			{
				iCount++;
			}
			render(gl,iCount);//进行绘制
			requestAnimationFrame(tick, canvas);
		};
		tick();
};
	
//----------------------------------	
//绘制函数，参数为WebGL上下文
function render(gl,iCount)
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//用背景色擦除窗口内容
	//使用顶点数组进行绘制
	gl.drawArrays(gl.TRIANGLES,//绘制图元类型为三角形
			0,	//从第0个顶点属性数据开始绘制
			//NumVertices * 4
			iCount //使用顶点个数
			);	
			
}

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	