ig.module(
    'plugins.box2d.collision'
)
.requires(
    'plugins.box2d.entity',
    'plugins.box2d.game'
)
.defines(function(){

ig.Box2DEntity.inject({

    init: function (x, y, settings) {
        this.parent(x, y, settings);
        if (!ig.global.wm) {
            this.body.entity = this;
        }
    }

});

ig.Box2DGame.inject({

    // remove impact's collision detection for performance
    // comment out this line if you're using both
    // ig.Entity and ig.Box2dEntity
    checkEntities: function () {},

    loadLevel: function (data) {
        this.parent(data);

        var handleContact = function(point){
            var a = point.shape1.GetBody().entity,
                b = point.shape2.GetBody().entity;

            // is this an entity collision?
            if (!a || !b) {
                return;
            }

            // preserve impact's entity checks even
            // though these are unnecessary
            if (a.checkAgainst & b.type) {
                a.check(b);
            }

            if (b.checkAgainst & a.type) {
                b.check(a);
            }

            // call impact
            // favor the axis of greater penetration
            if (Math.abs(point.normal.y) > Math.abs(point.normal.x)) {
                a.collideWith(b, 'y');
                b.collideWith(a, 'y');
            } else {
                a.collideWith(b, 'x');
                b.collideWith(a, 'x');
            }
        };

        var listener = new Box2D.Dynamics.b2ContactListener();
        listener.Add = handleContact;      // on first contact
        listener.Persist = handleContact;  // on subsequent contacts

        // attach to box2d world
        ig.world.SetContactListener(listener);
    }

});

});
