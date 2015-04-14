
var WorldSceneLayer = cc.Layer.extend({
    sprite:null,
    player:null,
    tmxmap: null,
    entities: null,
    playerLastPos: null,
    mapNode: null,
    mapName: "",
    ctor:function () {
        //////////////////////////////
        // super init first
        this._super();
		this.entities = {};
		this.mapNode = new cc.Node();
        return true;
    },

    onEnter: function () 
    {
        this._super();

		this.addChild(this.mapNode);
		
    	// 初始化UI
    	this.initUI();

    	// 安装这个场景需要监听的KBE事件
        this.installEvents();

		// 监听鼠标触摸等输入输出事件
		this.installInputEvents(this);
		
        // 激活update
        //this.schedule(this.worldUpdate, 0.1, cc.REPEAT_FOREVER, 0.1);
        this.scheduleUpdate();
    },
    	    
    onExit: function () {
    	this._super();
    },
    	
    /* -----------------------------------------------------------------------/
    							UI 相关
    /------------------------------------------------------------------------ */
	initUI : function()
    {
        // ask the window size
        var size = cc.winSize;
            	
        // debug
        new GUIDebugLayer();
        this.addChild(GUIDebugLayer.debug, 100);    	
    },

    /* -----------------------------------------------------------------------/
    							输入输出事件 相关
    /------------------------------------------------------------------------ */
	installInputEvents : function(target)
	{
        if( 'mouse' in cc.sys.capabilities ) {
            cc.eventManager.addListener({
                 event: cc.EventListener.MOUSE,
                onMouseDown: this.onMouseDown,
                onMouseMove: this.onMouseMove,
                onMouseUp: this.onMouseUp
            }, target);
        } else {
	        if( 'touches' in cc.sys.capabilities )
	            cc.eventManager.addListener(cc.EventListener.create({
	                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
	                onTouchesEnded:this.onTouchesEnded
	            }), this);
            else        	
          	  cc.log("MOUSE and TOUCH Not supported");
        }		
	},
		
    onMouseDown: function(event)
    {
        var pos = event.getLocation(), target = event.getCurrentTarget();
        var locationInNode = target.convertToNodeSpace(pos);
        var s = target.getContentSize();
        var rect = cc.rect(0, 0, s.width, s.height);
		
		// 检查是否在区域内
        if (cc.rectContainsPoint(rect, locationInNode))
		{
	        if(event.getButton() === cc.EventMouse.BUTTON_RIGHT)
	            cc.log("onRightMouseDown at: " + pos.x + " " + pos.y);
	        else if(event.getButton() === cc.EventMouse.BUTTON_LEFT)
	            cc.log("onLeftMouseDown at: " + pos.x + " " + pos.y);
		}
    },
    	
    onMouseMove: function(event)
    {
        //var pos = event.getLocation(), target = event.getCurrentTarget();
        //cc.log("onMouseMove at: " + pos.x + " " + pos.y );
    },
    	
    onMouseUp: function(event)
    {
        var pos = event.getLocation(), target = event.getCurrentTarget();
        var locationInNode = target.convertToNodeSpace(pos);
        var s = target.getContentSize();
        var rect = cc.rect(0, 0, s.width, s.height);
		
		// 检查是否在区域内
        if (cc.rectContainsPoint(rect, locationInNode))
		{
			target.onClickUp(pos);
		}
    },

	onTouchesEnded : function (touches, event) 
	{
        if (touches.length <= 0)
            return;
        
        var pos = touches[0].getLocation(), target = event.getCurrentTarget();
        
        var locationInNode = target.convertToNodeSpace(pos);
        var s = target.getContentSize();
        var rect = cc.rect(0, 0, s.width, s.height);
		
		// 检查是否在区域内
        if (cc.rectContainsPoint(rect, locationInNode))
		{
			target.onClickUp(pos);
		}
	},
	
	onClickUp : function(pos)
	{
		cc.log("onClickUp at: " + pos.x + " " + pos.y );
        this.player.moveTo(this.mapNode.convertToNodeSpace(pos));
	},
		
    /* -----------------------------------------------------------------------/
    							KBEngine 事件响应
    /------------------------------------------------------------------------ */
    installEvents : function()
    {
		// common
		KBEngine.Event.register("onKicked", this, "onKicked");
		KBEngine.Event.register("onDisableConnect", this, "onDisableConnect");
		KBEngine.Event.register("onConnectStatus", this, "onConnectStatus");
		
		// in world
		KBEngine.Event.register("addSpaceGeometryMapping", this, "addSpaceGeometryMapping");
		KBEngine.Event.register("onAvatarEnterWorld", this, "onAvatarEnterWorld");
		KBEngine.Event.register("onEnterWorld", this, "onEnterWorld");
		KBEngine.Event.register("onLeaveWorld", this, "onLeaveWorld");
		KBEngine.Event.register("set_position", this, "set_position");
		KBEngine.Event.register("set_direction", this, "set_direction");
		KBEngine.Event.register("update_position", this, "update_position");
		KBEngine.Event.register("set_HP", this, "set_HP");
		KBEngine.Event.register("set_MP", this, "set_MP");
		KBEngine.Event.register("set_HP_Max", this, "set_HP_Max");
		KBEngine.Event.register("set_MP_Max", this, "set_MP_Max");
		KBEngine.Event.register("set_level", this, "set_level");
		KBEngine.Event.register("set_name", this, "set_entityName");
		KBEngine.Event.register("set_state", this, "set_state");
		KBEngine.Event.register("set_moveSpeed", this, "set_moveSpeed");
		KBEngine.Event.register("set_modelScale", this, "set_modelScale");
		KBEngine.Event.register("set_modelID", this, "set_modelID");
		KBEngine.Event.register("recvDamage", this, "recvDamage");
		KBEngine.Event.register("otherAvatarOnJump", this, "otherAvatarOnJump");
		KBEngine.Event.register("onAddSkill", this, "onAddSkill");
    },

	onKicked : function(failedcode)
	{
	},
		
	onDisableConnect : function()
	{
	},
		
	onConnectStatus : function(success)
	{
		if(!success)
			GUIDebugLayer.debug.ERROR_MSG("connect(" + g_kbengine.ip + ":" + g_kbengine.port + ") is error! (连接错误)");
		else
			GUIDebugLayer.debug.INFO_MSG("connect successfully, please wait...(连接成功，请等候...)");
	},

	addSpaceGeometryMapping : function(resPath)
	{
		this.mapName = resPath;
		
        // 创建场景
        this.createScene("res/img/3/cocosjs_demo_map1.tmx");
        this.fixMap();
	},
	
	onAvatarEnterWorld : function(rndUUID, eid, avatar)
	{
		// 角色进入世界，创建角色精灵
		this.player = new Avatar(this, "res/img/3/clotharmor.png");
        this.player.attr({
            x: avatar.position.x * 16,
            y: avatar.position.z * 16,
            anchorX: 0.5
        });

		this.mapNode.addChild(this.player, 10);
        this.entities[avatar.id] = this.player;
        this.playerLastPos = cc.p(this.player.x, this.player.y);
        
        this.fixMap();
	},

	fixMap : function()
	{
		if(this.tmxmap == null || this.player == null)
			return;
		
		var size = cc.winSize;
		
        // 将角色放置于屏幕中心
        this.mapNode.x = this.mapNode.x - this.player.x + (size.width / 2);	
		this.mapNode.y = this.mapNode.y - this.player.y + (size.height / 2);	
	},
		
	onEnterWorld : function(entity)
	{
		if(!entity.isPlayer())
		{
			var ae = new ActionEntity(this, "res/img/3/crab.png");
	        ae.attr({
	            x: entity.position.x * 16,
	            y: entity.position.z * 16,
	            anchorX: 0.5
	        });

	        this.mapNode.addChild(ae, 10);
	        this.entities[entity.id] = ae;
	    }

		// 实体第一次进入到这个世界时这些属性不属于值改变行为，造成事件不会触发
		// 这里我们强制进行一次相关表现上的设置
		this.set_moveSpeed(entity, entity.moveSpeed);
		this.set_state(entity, entity.state);
		this.set_modelID(entity, entity.modelID);
		this.set_modelScale(entity, entity.modelScale);
		this.set_entityName(entity, entity.name);
		this.set_HP(entity, entity.HP);	
	},

	onLeaveWorld : function(entity)
	{
		this.removeChild(this.entities[entity.id]);
		delete this.entities[entity.id];
	},

	set_position : function(entity)
	{
		// 强制将位置设置到坐标点
		var ae = this.entities[entity.id];
		ae.x = entity.position.x * 16;
		ae.y = entity.position.z * 16;
		ae.destPosition.x = entity.position.x * 16;
		ae.destPosition.y = entity.position.z * 16;
	},

	update_position : function(entity)
	{
		var ae = this.entities[entity.id];
	},	

	set_direction : function(entity)
	{
		var ae = this.entities[entity.id];
	},

	set_HP : function(entity, v)
	{
		var ae = this.entities[entity.id];
	},

	set_MP : function(entity, v)
	{
		var ae = this.entities[entity.id];
	},

	set_HP_Max : function(entity, v)
	{
		var ae = this.entities[entity.id];
	},	
		
	set_MP_Max : function(entity, v)
	{
		var ae = this.entities[entity.id];
	},

	set_level : function(entity, v)
	{
		var ae = this.entities[entity.id];
	},

	set_entityName : function(entity, v)
	{
		var ae = this.entities[entity.id];
		ae.setName(v);
	},	

	set_state : function(entity, v)
	{
		var ae = this.entities[entity.id];
		ae.setState(v);
	},

	set_moveSpeed : function(entity, v)
	{
		var ae = this.entities[entity.id];
		ae.setSpeed(v / 10.0);
	},

	set_modelScale : function(entity, v)
	{
		var ae = this.entities[entity.id];
	},

	set_modelID : function(entity, v)
	{
		var ae = this.entities[entity.id];
		switch(v)
		{
			case 80001001:
				ae.setSprite("res/img/3/crab.png");
				break;
			case 80002001:
				ae.setSprite("res/img/3/rat.png");
				break;
			case 80003001:
				ae.setSprite("res/img/3/bat.png");
				break;
			case 80004001:
				ae.setSprite("res/img/3/bat.png");
				break;
			case 80005001:
				ae.setSprite("res/img/3/bat.png");
				break;
			case 80006001:
				ae.setSprite("res/img/3/firefox.png");
				break;
			case 80007001:
				ae.setSprite("res/img/3/skeleton2.png");
				break;
			case 80008001:
				ae.setSprite("res/img/3/snake.png");
				break;
			case 80009001:
				ae.setSprite("res/img/3/skeleton.png");
				break;		
			case 80010001:
				ae.setSprite("res/img/3/ogre.png");
				break;
			case 80011001:
				ae.setSprite("res/img/3/goblin.png");
				break;
			case 80012001:
				ae.setSprite("res/img/3/eye.png");
				break;
			case 80013001:
				ae.setSprite("res/img/3/spectre.png");
				break;
			case 80014001:
				ae.setSprite("res/img/3/boss.png");
				break;																																		
		};
	},

	recvDamage : function(entity, attacker, skillID, damageType, damage)
	{
		var ae = this.entities[entity.id];
	},

	onAddSkill : function(entity)
	{
		var ae = this.entities[entity.id];
	},

	otherAvatarOnJump : function(entity)
	{
		var ae = this.entities[entity.id];
	},
															
    /* -----------------------------------------------------------------------/
    							其他系统相关
    /------------------------------------------------------------------------ */
	createScene : function(resPath)
    {
        this.tmxmap = cc.TMXTiledMap.create(resPath);    
        this.mapNode.addChild(this.tmxmap, 1, NODE_TAG_TMX);
    },

    worldUpdate : function (dt) 
    {
    },
    
    update : function (dt) 
    {
    	if(this.tmxmap == null || this.playerLastPos == null)
    		return;
    	
    	GUIDebugLayer.debug.INFO_MSG("[scene] = " + this.mapName + ", [pos] = (" + Math.round(this.player.x) + ", " + Math.round(this.player.y) + ")");
    	    	
    	var x = this.playerLastPos.x - this.player.x;
    	var y = this.playerLastPos.y - this.player.y;

    	this.playerLastPos.x = this.player.x;
    	this.playerLastPos.y = this.player.y;
    	
    	var pos = this.convertToNodeSpace(cc.p(x, y));
    	this.mapNode.x += pos.x;
    	this.mapNode.y += pos.y;
    	
    	var player = KBEngine.app.player();
		player.position.x = this.player.x / 16;
		player.position.y = 0;
		player.position.z = this.player.y / 16;
		player.direction.x = 0;
		player.direction.y = 0;		
		player.direction.z = this.player.getDir();
		KBEngine.app.isOnGound = 1;
    }
});


var WorldScene = cc.Scene.extend({
    onEnter:function () 
    {
        this._super();
        
        // 创建基本场景层
        var layer = new WorldSceneLayer();
        this.addChild(layer);
    }
});

