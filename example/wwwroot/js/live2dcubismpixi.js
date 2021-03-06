var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(d, b) {
          d.__proto__ = b;
        }) ||
      function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
var LIVE2DCUBISMPIXI;
(function(LIVE2DCUBISMPIXI) {
  var Model = (function(_super) {
    __extends(Model, _super);
    function Model(coreModel, textures, animator, physicsRig) {
      var _this = _super.call(this) || this;
      _this._coreModel = coreModel;
      _this._textures = textures;
      _this._animator = animator;
      _this._physicsRig = physicsRig;
      if (_this._coreModel == null) {
        return _this;
      }
      _this._meshes = new Array(_this._coreModel.drawables.ids.length);
      for (var m = 0; m < _this._meshes.length; ++m) {
        var uvs = _this._coreModel.drawables.vertexUvs[m].slice(
          0,
          _this._coreModel.drawables.vertexUvs[m].length
        );
        for (var v = 1; v < uvs.length; v += 2) {
          uvs[v] = 1 - uvs[v];
        }
        _this._meshes[m] = new PIXI.mesh.Mesh(
          textures[_this._coreModel.drawables.textureIndices[m]],
          _this._coreModel.drawables.vertexPositions[m],
          uvs,
          _this._coreModel.drawables.indices[m],
          PIXI.DRAW_MODES.TRIANGLES
        );
        _this._meshes[m].scale.y *= -1;
        if (
          Live2DCubismCore.Utils.hasBlendAdditiveBit(
            _this._coreModel.drawables.constantFlags[m]
          )
        ) {
          if (_this._coreModel.drawables.maskCounts[m] > 0) {
            var addFilter = new PIXI.Filter();
            addFilter.blendMode = PIXI.BLEND_MODES.ADD;
            _this._meshes[m].filters = [addFilter];
          } else {
            _this._meshes[m].blendMode = PIXI.BLEND_MODES.ADD;
          }
        } else if (
          Live2DCubismCore.Utils.hasBlendMultiplicativeBit(
            _this._coreModel.drawables.constantFlags[m]
          )
        ) {
          if (_this._coreModel.drawables.maskCounts[m] > 0) {
            var multiplyFilter = new PIXI.Filter();
            multiplyFilter.blendMode = PIXI.BLEND_MODES.MULTIPLY;
            _this._meshes[m].filters = [multiplyFilter];
          } else {
            _this._meshes[m].blendMode = PIXI.BLEND_MODES.MULTIPLY;
          }
        }
        _this.addChild(_this._meshes[m]);
      }
      _this._maskSpriteContainer = new MaskSpriteContainer(coreModel, _this);
      return _this;
    }
    Object.defineProperty(Model.prototype, 'parameters', {
      get: function() {
        return this._coreModel.parameters;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Model.prototype, 'parts', {
      get: function() {
        return this._coreModel.parts;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Model.prototype, 'drawables', {
      get: function() {
        return this._coreModel.drawables;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Model.prototype, 'textures', {
      get: function() {
        return this._textures;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Model.prototype, 'animator', {
      get: function() {
        return this._animator;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Model.prototype, 'meshes', {
      get: function() {
        return this._meshes;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Model.prototype, 'masks', {
      get: function() {
        return this._maskSpriteContainer;
      },
      enumerable: true,
      configurable: true
    });
    Model.prototype.update = function(delta) {
      var _this = this;
      var deltaTime = 0.016 * delta;
      this._animator.updateAndEvaluate(deltaTime);
      if (this._physicsRig) {
        this._physicsRig.updateAndEvaluate(deltaTime);
      }
      this._coreModel.update();
      var sort = false;
      for (var m = 0; m < this._meshes.length; ++m) {
        this._meshes[m].alpha = this._coreModel.drawables.opacities[m];
        this._meshes[m].visible = Live2DCubismCore.Utils.hasIsVisibleBit(
          this._coreModel.drawables.dynamicFlags[m]
        );
        if (
          Live2DCubismCore.Utils.hasVertexPositionsDidChangeBit(
            this._coreModel.drawables.dynamicFlags[m]
          )
        ) {
          this._meshes[m].vertices = this._coreModel.drawables.vertexPositions[
            m
          ];
          this._meshes[m].dirtyVertex = true;
        }
        if (
          Live2DCubismCore.Utils.hasRenderOrderDidChangeBit(
            this._coreModel.drawables.dynamicFlags[m]
          )
        ) {
          sort = true;
        }
      }
      if (sort) {
        this.children.sort(function(a, b) {
          var aIndex = _this._meshes.indexOf(a);
          var bIndex = _this._meshes.indexOf(b);
          var aRenderOrder = _this._coreModel.drawables.renderOrders[aIndex];
          var bRenderOrder = _this._coreModel.drawables.renderOrders[bIndex];
          return aRenderOrder - bRenderOrder;
        });
      }
      this._coreModel.drawables.resetDynamicFlags();
    };
    Model.prototype.destroy = function(options) {
      if (this._coreModel != null) {
        this._coreModel.release();
      }
      _super.prototype.destroy.call(this, options);
      this.masks.destroy();
      this._meshes.forEach(function(m) {
        m.destroy();
      });
      if (options == true || options.texture) {
        this._textures.forEach(function(t) {
          t.destroy();
        });
      }
    };
    Model._create = function(coreModel, textures, animator, physicsRig) {
      if (physicsRig === void 0) {
        physicsRig = null;
      }
      var model = new Model(coreModel, textures, animator, physicsRig);
      if (!model.isValid) {
        model.destroy();
        return null;
      }
      return model;
    };
    Object.defineProperty(Model.prototype, 'isValid', {
      get: function() {
        return this._coreModel != null;
      },
      enumerable: true,
      configurable: true
    });
    return Model;
  })(PIXI.Container);
  LIVE2DCUBISMPIXI.Model = Model;
  var MaskSpriteContainer = (function(_super) {
    __extends(MaskSpriteContainer, _super);
    function MaskSpriteContainer(coreModel, pixiModel) {
      var _this = _super.call(this) || this;
      _this._maskShaderVertSrc = new String(
        '\n            attribute vec2 aVertexPosition;\n            attribute vec2 aTextureCoord;\n            uniform mat3 projectionMatrix;\n            varying vec2 vTextureCoord;\n            void main(void){\n                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n                vTextureCoord = aTextureCoord;\n            }\n            '
      );
      _this._maskShaderFragSrc = new String(
        '\n            varying vec2 vTextureCoord;\n            uniform sampler2D uSampler;\n            void main(void){\n                vec4 c = texture2D(uSampler, vTextureCoord);\n                c.r = c.a;\n                c.g = 0.0;\n                c.b = 0.0;\n                gl_FragColor = c;\n            }\n            '
      );
      _this._maskShader = new PIXI.Filter(
        _this._maskShaderVertSrc.toString(),
        _this._maskShaderFragSrc.toString()
      );
      var _maskCounts = coreModel.drawables.maskCounts;
      var _maskRelationList = coreModel.drawables.masks;
      _this._maskMeshContainers = new Array();
      _this._maskTextures = new Array();
      _this._maskSprites = new Array();
      for (var m = 0; m < pixiModel.meshes.length; ++m) {
        if (_maskCounts[m] > 0) {
          var newContainer = new PIXI.Container();
          for (var n = 0; n < _maskRelationList[m].length; ++n) {
            var meshMaskID = coreModel.drawables.masks[m][n];
            var maskMesh = new PIXI.mesh.Mesh(
              pixiModel.meshes[meshMaskID].texture,
              pixiModel.meshes[meshMaskID].vertices,
              pixiModel.meshes[meshMaskID].uvs,
              pixiModel.meshes[meshMaskID].indices,
              PIXI.DRAW_MODES.TRIANGLES
            );
            maskMesh.transform = pixiModel.meshes[meshMaskID].transform;
            maskMesh.worldTransform =
              pixiModel.meshes[meshMaskID].worldTransform;
            maskMesh.localTransform =
              pixiModel.meshes[meshMaskID].localTransform;
            maskMesh.filters = [_this._maskShader];
            newContainer.addChild(maskMesh);
          }
          newContainer.transform = pixiModel.transform;
          newContainer.worldTransform = pixiModel.worldTransform;
          newContainer.localTransform = pixiModel.localTransform;
          _this._maskMeshContainers.push(newContainer);
          var newTexture = PIXI.RenderTexture.create(0, 0);
          _this._maskTextures.push(newTexture);
          var newSprite = new PIXI.Sprite(newTexture);
          _this._maskSprites.push(newSprite);
          _this.addChild(newSprite);
          pixiModel.meshes[m].mask = newSprite;
        }
      }
      return _this;
    }
    Object.defineProperty(MaskSpriteContainer.prototype, 'maskSprites', {
      get: function() {
        return this._maskSprites;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(MaskSpriteContainer.prototype, 'maskMeshes', {
      get: function() {
        return this._maskMeshContainers;
      },
      enumerable: true,
      configurable: true
    });
    MaskSpriteContainer.prototype.destroy = function(options) {
      this._maskSprites.forEach(function(m) {
        m.destroy();
      });
      this._maskTextures.forEach(function(m) {
        m.destroy();
      });
      this._maskMeshContainers.forEach(function(m) {
        m.destroy();
      });
      this._maskShader = null;
    };
    MaskSpriteContainer.prototype.update = function(appRenderer) {
      for (var m = 0; m < this._maskSprites.length; ++m) {
        appRenderer.render(
          this._maskMeshContainers[m],
          this._maskTextures[m],
          true,
          null,
          false
        );
      }
    };
    MaskSpriteContainer.prototype.resize = function(viewWidth, viewHeight) {
      for (var m = 0; m < this._maskTextures.length; ++m) {
        this._maskTextures[m].resize(viewWidth, viewHeight, false);
      }
    };
    return MaskSpriteContainer;
  })(PIXI.Container);
  LIVE2DCUBISMPIXI.MaskSpriteContainer = MaskSpriteContainer;
  var ModelBuilder = (function() {
    function ModelBuilder() {
      this._textures = new Array();
      this._timeScale = 1;
      this._animatorBuilder = new LIVE2DCUBISMFRAMEWORK.AnimatorBuilder();
    }
    ModelBuilder.prototype.setMoc = function(value) {
      this._moc = value;
      return this;
    };
    ModelBuilder.prototype.setTimeScale = function(value) {
      this._timeScale = value;
      return this;
    };
    ModelBuilder.prototype.setPhysics3Json = function(value) {
      if (!this._physicsRigBuilder) {
        this._physicsRigBuilder = new LIVE2DCUBISMFRAMEWORK.PhysicsRigBuilder();
      }
      this._physicsRigBuilder.setPhysics3Json(value);
      return this;
    };
    ModelBuilder.prototype.addTexture = function(index, texture) {
      this._textures.splice(index, 0, texture);
      return this;
    };
    ModelBuilder.prototype.addAnimatorLayer = function(name, blender, weight) {
      if (blender === void 0) {
        blender = LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
      }
      if (weight === void 0) {
        weight = 1;
      }
      this._animatorBuilder.addLayer(name, blender, weight);
      return this;
    };
    ModelBuilder.prototype.build = function() {
      var coreModel = Live2DCubismCore.Model.fromMoc(this._moc);
      if (coreModel == null) {
        return null;
      }
      var animator = this._animatorBuilder
        .setTarget(coreModel)
        .setTimeScale(this._timeScale)
        .build();
      var physicsRig = null;
      if (this._physicsRigBuilder) {
        physicsRig = this._physicsRigBuilder
          .setTarget(coreModel)
          .setTimeScale(this._timeScale)
          .build();
      }
      return Model._create(coreModel, this._textures, animator, physicsRig);
    };
    return ModelBuilder;
  })();
  LIVE2DCUBISMPIXI.ModelBuilder = ModelBuilder;
})(LIVE2DCUBISMPIXI || (LIVE2DCUBISMPIXI = {}));
