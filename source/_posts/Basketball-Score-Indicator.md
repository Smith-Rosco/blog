---
title: Basketball_Score_Indicator
abbrlink: 3db63790
date: 2023-05-31 15:16:23
tags:
cover:
top_img:
description: FPGA篮球计分器
---

# Basketball_Score_Indicator

## 顶层模块

```verilog
module Basketball_Score_Indicator (
    input       clk, 
    input       clear_key,  // 清屏信号，下降沿触发
    input       rst_n,      // 复位信号，下降沿触发
    input       switch,     // 倒计时开关，高电平有效
    input       key_1,      // 队伍一加分按键，下降沿触发，加一分
    input       key_2,      // 队伍二加分按键，下降沿触发，加一分
    output      vcc, gnd,
    output      scl,        // IIC 通信时钟信号
    inout       sda         // IIC 通信数据信号
);
	 assign vcc = 1;
	 assign gnd = 0;

    // 输入按键消抖
    wire key_1_out, key_2_out;

    Remove_Jitter   Remove_Jitter_Instance_1(
        .clk        (clk),
        .rst_n      (rst_n),
        .sw_in      (key_1),
        .sw_out     (key_1_out)
    );

    Remove_Jitter   Remove_Jitter_Instance_2(
        .clk        (clk),
        .rst_n      (rst_n),
        .sw_in      (key_2),
        .sw_out     (key_2_out)
    );

    // OLED 显示
    Oled_Top        Oled_Top_Instance(
        .clk        (clk),
        .rst        (rst_n),
        .clear_key  (clear_key),
        .scl        (scl),
        .sda        (sda),

        .key_1      (key_1_out),
        .key_2      (key_2_out),
        .switch     (switch)
    );
endmodule
```

## 消抖模块

```verilog
// 按键消抖模块
module Remove_Jitter(
    input clk,
    input rst_n,
    input sw_in,
    output reg sw_out
    );
	
	//按键本身值为1，按下按键后键值为0.
	reg sw_in_r0;
	
	always @ (posedge clk or negedge rst_n) begin
		if(!rst_n) begin
			sw_in_r0 <= 1;
		end
		else begin
			sw_in_r0 <= sw_in;
		end
	end
	
	wire edge_l, edge_h;
	assign edge_l = sw_in_r0 & (~sw_in); //下降沿检测
	assign edge_h = sw_in & (~sw_in_r0);//上升沿检测
	
	wire edge_en; //键值变化后，edge_en变为高
	assign edge_en = edge_l | edge_h;
	
	reg [19:0] count;
	always @ (posedge clk or negedge rst_n) begin
		if(!rst_n) begin
			count <= 0;
		end
		else if(edge_en) begin
			count <= 0;
		end
		else begin
			count <= count + 1;
		end
	
	end
	
	always @ (posedge clk or negedge rst_n) begin
		if(!rst_n) begin
			sw_out <= 1'b1;
		end
		else if(count == 20'h2BF20) begin
			sw_out <= sw_in;
		end
		else begin
			;
		end
	end
	
	
	
endmodule
```

## OLED 显示模块

```verilog
//oled顶层模块
module    Oled_Top(
	input			clk,
	input			rst,	
	
	input			clear_key,
	
	output		scl,
	inout			sda,
	input 		key_1, key_2, switch
);
wire on_key;
assign onkey = clk;

assign gnd = 0;
localparam			RST_T			=	1'b0;				//复位有效

localparam		Oled_Idle		=	11'b000_0000_0001;		//oled初始��?
localparam		Oled_Init		=	11'b000_0000_0010;		//oled初始��?
localparam		Oled_Clear		=	11'b000_0000_0100;		//oled初始��?
localparam		Oled_On			=	11'b000_0000_1000;		//oled初始��?
localparam		Oled_Show		=	11'b000_0001_0000;		//oled初始��?


reg[10:0]		state	, 	next_state;
//init

wire		init_req;			//初始化请��?
wire		init_finish;
wire[23:0]	init_data;
reg[35:0]	delay_time;

//clear
wire		clear_req;			//初始化请��?
wire		clear_ack;
wire[23:0]	clear_data;

//on
wire		on_req;			//初始化请��?
wire		on_ack;
wire[23:0]	on_data;

//show
wire[6:0]	start_x;
wire[3:0]	start_y;
wire[5:0]	show_select;	
wire		show_req;
wire		show_ack;
wire[23:0]	show_data;
wire		show_end;

wire		w_ack;			//IIC传输应答
reg[23:0] 	iic_data;
wire		iic_req;

always@(*)
begin
	case(state)
		Oled_Init:	
			iic_data <=init_data;
		Oled_Idle:
			iic_data <=23'd0;
		Oled_Clear:
			iic_data <=clear_data;
		Oled_On:
			iic_data <=on_data;
		Oled_Show:
			iic_data <=show_data;
		default:
			iic_data <=23'd0;
	endcase
end

assign iic_req = ( init_req == 1'b1 || clear_req == 1'b1 || on_req == 1'b1 || show_req == 1'b1)? 1'b1 : 1'b0;



assign clear_req = (state == Oled_Clear) ? 1'b1 : 1'b0;
assign on_req = (state == Oled_On) ? 1'b1 : 1'b0;
assign show_req = (state == Oled_Show) ? 1'b1 : 1'b0;
assign init_req = (state == Oled_Init && delay_time >='d500_000) ? 1'b1 : 1'b0;

//上电延时
always@(posedge clk or negedge rst)
begin
	if(rst == RST_T)
		delay_time <= 'd0;
	else if(delay_time >= 'd500_000)
		delay_time <= delay_time;
	else
		delay_time <= delay_time + 1'b1;
end

always@(posedge clk or negedge rst)
begin
	if(rst == RST_T)
		state <= Oled_Init;
	else
		state <= next_state;
end

always@(*)
begin
	case(state)
		Oled_Init:	
			if(init_finish == 1'b1)
				next_state <= Oled_Idle;
			else
				next_state <= Oled_Init;
		Oled_Idle:
			if(clear_key == 1'b0)
				next_state <= Oled_Clear;
			else if(on_key == 1'b0)
				next_state <= Oled_Show;
			else
				next_state <= Oled_Idle;
		Oled_Clear:
			if(clear_ack == 1'b1)
				next_state <= Oled_Idle;
			else
				next_state <= Oled_Clear;
		Oled_On:
			if(on_ack == 1'b1)
				next_state <= Oled_Idle;
			else
				next_state <= Oled_On;
		Oled_Show:
			if(show_end == 1'b1)
				next_state <= Oled_Idle;
			else
				next_state <= Oled_Show;
		default:
			next_state <= Oled_Idle;
	endcase
end


		
		

I2C_Master I2C_Master_V(
        .I_Clk_in		(clk),
        .I_Rst_n		(rst),
        .O_SCL			(scl),
        .IO_SDA			(sda),
        //control_sig
        .I_Start		(iic_req), 
        .O_Done			(w_ack),    
        .I_R_W_SET		(1),
        .I_Slave_Addr	(iic_data[23:17]),
        .I_R_W_Data		(iic_data[15:0]),
		.O_Data			(),    
        .O_Error		()    
 );
 
 
 Oled_Init   	Oled_Init_HP(
	
	.clk			(clk),
	.rst			(rst),
	.init_req		(init_req),		//初始化请��?
	.write_done		(w_ack),		//��?组初始化数据完成信号
	.init_finish	(init_finish),	//初始化完成输��?
	.Init_data		(init_data)		//初始化的数据
);


Oled_Clear Oled_Clear_HP(
	.clk		(clk),
	.rst 		(rst),
	
	.write_done	(w_ack),		//清除��?组数据完��?
	
	.clear_req 	(clear_req),		//清除请求
	.clear_ack 	(clear_ack),		//清除完成
	
	.clear_data	(clear_data)		//清除数据的命��?
);	

Oled_On  Oled_On_HP(
	.clk 		(clk),
	.rst 		(rst),
	.write_done	(w_ack),		//写入��?组数据完��?
	.On_req		(on_req),		//��?启请��?
	.On_ack		(on_ack),		//��?启完��?
	.On_data	(on_data)		//��?启数据的命令
);	

Oled_Show_control  Oled_Show_control_HP(
	
	.clk		(clk),
	.rst  		(rst),
	.show_ack	(show_ack),
	.show_req	(show_req),
	.show_end	(show_end),
	.start_x	(start_x),
	.start_y	(start_y),	
	.show_select(show_select)			//显示数据索引
);

Oled_Show_Info  Oled_Show_Info_HP(
	.clk		(clk),
	.rst		(rst),
	
	.write_done	(w_ack),		//清除��?组数据完��?
	
	//起始坐标
	.start_x	(start_x),
	.start_y	(start_y),	
	
	.show_select(show_select),			//显示数据索引
	
	.show_req 	(show_req),		//显示请求
	.show_ack 	(show_ack),		//显示完成
	
	.show_data	(show_data),	//清除数据的命��?
	.dd1			(dd1),
	.d1			(d1),
	.dd2			(dd2),
	.d2			(d2),
	.cc			(cc),
	.c				(c)
);

wire [3:0] dd1, d1, dd2, d2, cc, c;

key_detect ket_detect_HP(
	.key_1			(key_1),
	.key_2			(key_2),
	.rst_n			(rst),
	.dd1				(dd1),
	.d1				(d1),
	.dd2				(dd2),
	.d2				(d2)
	
);

count_down count_down_HP(
	.clk						(clk),
	.rst_n					(rst),
	.cc						(cc),
	.c							(c),
	.switch					(switch)
);
endmodule 
```

完整源文件下载：https://wwcp.lanzout.com/b04k1hzdg
密码:86qb

