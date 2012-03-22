/**
    Movable is a box capable of using a collision detector and reacting 
    to collisions.
*/
function Movable(xPos, yPox, boxWidth, boxHeight) {
    this.velocity = {
        x: 0,
        y: 0
    };

    this.boundingBox = {
        x: xPos || 0,
        y: yPox || 0,
        width: boxWidth || 0,
        height: boxHeight || 0
    };

    this.collisionInfo = {
        isCollisionX: false,    // Whether a collision has occurred on X axis
        isCollisionY: false,    // Whether a collision has occurred on Y axis
        worldX: 0,              // The world X coordinate that was checked
        worldY: 0,              // The world Y coordinate that was checked
        directionX: null,       // The horizontal direction that the object was traveling
        directionY: null,       // The vertical direction that hte object was traveling
        tileX: 0,               // The tile X coordinate that was checked
        tileY: 0,               // The tile Y coordinate that was checked
        correctedX: 0,          // The adjusted coordinate to resolve collision on X axis
        correctedY: 0,          // The adjusted coordinate to resolve collision on Y axis
        tileType: 0
    };

    this.isOnGroundNow = false;
    this.wasGroundLastFrame = false;
    this.isAffectedByGravity = false;
    this.doesCollideWithWorld = false;
}

/**
    All Movable objects share a collision resolver. 
    It must provide a set of functions to check for both 
    horizontal and vertical collisions with the world.
*/
Movable.collisionResolver = {
    checkHorizontalEdge: function() { },
    checkVerticalEdge: function() { }
};

/**
    All "gravitized" movable objects are affected by gravity the same.
    This value will affect the vertical velocity of all Movable
    objects if they are affected by gravity.
*/
Movable.gravity = 0.25;

/**
    Clears all collision information for this Movable.
*/
Movable.prototype.clearCollisionInfo = function() {
    this.collisionInfo.isCollisionX = this.collisionInfo.isCollisionY = false;
    this.collisionInfo.worldX = this.collisionInfo.worldY = 0;
    this.collisionInfo.directionX = this.collisionInfo.directionY = null;
    this.collisionInfo.tileX = this.collisionInfo.tileY = 0;
    this.collisionInfo.correctedX = this.collisionInfo.correctedY = 0;
    this.collisionInfo.tileType = 0;
};

/**
    Called before any collision checking occurs.
*/
Movable.prototype.preCheckCollision = function() { };

/**
    Performs collision detection and response.
*/
Movable.prototype.checkCollision = function() {
    this.clearCollisionInfo();

    if(this.preCheckCollision) {
        this.preCheckCollision();
    }

    // Check the horizontal axis first
    if(this.velocity.x < 0) {
        // Moving left
        // So only check the potential new left edge
        Movable.collisionResolver.checkHorizontalEdge(
            this.boundingBox.x + this.velocity.x,
            this.boundingBox.y,
            this.boundingBox.y + this.boundingBox.height - 1,
            DIRECTIONS.LEFT,
            this.collisionInfo
        );

        if(this.collisionInfo.isCollisionX) {
            this.boundingBox.x = this.collisionInfo.correctedX;
            this.velocity.x = 0;
        }
    } else if(this.velocity.x > 0) {
        // Moving right
        // So only check the potential new right edge
        Movable.collisionResolver.checkHorizontalEdge(
            this.boundingBox.x + this.boundingBox.width + this.velocity.x,
            this.boundingBox.y,
            this.boundingBox.y + this.boundingBox.height - 1,
            DIRECTIONS.RIGHT,
            this.collisionInfo
        );

        if(this.collisionInfo.isCollisionX) {
            this.boundingBox.x = this.collisionInfo.correctedX - this.boundingBox.width;
            this.velocity.x = 0;
        }
    }

    // Check the vertical axis second
    if(this.velocity.y < 0) {
        // Moving up
        // So only check the potential new top edge
        Movable.collisionResolver.checkVerticalEdge(
            this.boundingBox.y + this.velocity.y,
            this.boundingBox.x,
            this.boundingBox.x + this.boundingBox.width - 1,
            DIRECTIONS.UP,
            this.collisionInfo
        );

        if(this.collisionInfo.isCollisionY) {
            this.boundingBox.y = this.collisionInfo.correctedY;
            this.velocity.y = 0;
        }
    } else if(this.velocity.y > 0) {
        // Moving down
        // So only check the potential new bottom edge
        Movable.collisionResolver.checkVerticalEdge(
            this.boundingBox.y + this.boundingBox.height + this.velocity.y,
            this.boundingBox.x,
            this.boundingBox.x + this.boundingBox.width - 1,
            DIRECTIONS.DOWN,
            this.collisionInfo
        );

        if(this.collisionInfo.isCollisionY) {
            this.boundingBox.y = this.collisionInfo.correctedY - this.boundingBox.height;
            this.velocity.y = 0;
            this.isOnGroundNow = true;

            if(!this.wasGroundLastFrame) {
                if(this.onLanding) {
                    this.onLanding();
                }
            }
        }
    }

    if(this.postCheckCollision) {
        this.postCheckCollision();
    }
};

/**
    Called after collision detection/response happens.
*/
Movable.prototype.postCheckCollision = function() { };

/**
    Called when this object lands on the ground.
*/
Movable.prototype.onLanding = function() { };

Movable.prototype.update = function() {
    if(this.isAffectedByGravity) {
        // Apply gravity
        this.velocity.y += Movable.gravity;
    }

    if(this.doesCollideWithWorld) {
        this.checkCollision();
    }

    this.boundingBox.x += this.velocity.x;
    this.boundingBox.y += this.velocity.y;
};