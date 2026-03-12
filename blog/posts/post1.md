Hello!

Welcome to my first blogpost.

I've been developing my game engine "Flock" for the past 3 months now,
and I decided to make this series of devlogs to let everyone in on the
making of this engine, and hopefully inspire you to make your own.

The game engine uses OpenGL 3.3 for graphics along with several other
libraries which include:

- **GLFW** for windowing and input.
- **fmt** for logging.
- **ReactPhysics3D** for physics.
- **SoLoud** for audio loading and playback.
- **nlohmann::json** for JSON,
- **STB_Image** for image loading.

It all started while learning OpenGL on [learnopengl.com](https://learnopengl.com/),
I then decided to extend my graphics application into a basic game engine.

I first started making the ECS, I first tried the [EnTT](https://github.com/skypjack/entt) C++
library, but I ultimately decided to make my own ECS to get better integration with
the serialization system. It's also highly inspired by [Bevy](https://bevy.org/)'s design.
It's not by any means performant, but it gets the job done for now.
It consists of a *World* which contains a *Registry* and a hashmap of type-erased *Resources*
mapped to their type IDs:

```cpp
class World {
    Registry m_Registry;
    std::unordered_map<TypeId, std::any> m_Resources;
}
```

A *Resource* is like an ECS component but there is only one of it at any time.
I use it things like the camera, audio listener, etc.
I also use it for passing data into the ECS with things like the time state (time and delta time),
and input (heldKeys, releasedKeys, etc.).

The Registry is what owns the entities and components, it consists of a list
of entity data, and (similarly to the World class) it contains a hashmap of
type-erased component storages:

```cpp
struct EntityData {
    bool isAlive;
    u8 version;
}

class Registry {
    std::vector<EntityData> m_EntityData;
    std::unordered_map<TypeId, std::shared_ptr<IStorage>> m_Storages;
}
```

It also provides helper methods for managing entity lifetime and setting/retrieving component
data:

```cpp
struct Entity {
    u32 id : 24;     // Use 24 bits for the ID.
    u32 version : 8; // Use 8 bits for the version.
}

class Registry {
    // ...
public:
    template<typename... Args>
    Entity Create(Args... args)
    
    bool Destroy(Entity entity)
            
    template<typename T>
    OptionalRef<T> GetComponent(Entity entity
            
    template<typename T>
    bool AddComponent(Entity entity, T value = {})
    
    template<typename T>
    bool SetComponent(Entity entity, T value = {})
    
    template<typename T>
    bool RemoveComponent(Entity entity)
    
    template<typename... Args, typename F>
    void ForEach(F &&callback)
}
```

As you may have noticed, the error handling is not great. I mostly stick to booleans or
optionals for the error handling currently. I'm planning to either switch to C++23
to use `std::expected` or make my own implementation in the future.

The third part of ECS are the systems, for that there is the *Schedule*:

```cpp
using System = std::function<void(World &)>;

enum class Stage {
    Startup,
    Update
};

class FLK_API Schedule {
    std::unordered_map<Stage, std::vector<System> > m_Systems;

public:
    void Execute(Stage stage, World &world);
    void AddSystem(Stage stage, const System &system);
    void PopSystem(Stage stage);
};
```

As you can see, the Schedule is very basic at the moment, systems are just lambdas that
take a reference to the ECS World.
Systems are added to a *Stage* (Only Startup and Update currently) and executed by
the application either every frame or on startup.

For serialization, I've made a basic non-intrusive compile-time reflection system
that archives use, along with support for primitive types:

```cpp
template<typename T>
struct FLK_API Field {
    std::string name;
    T *         value;

    Field(const std::string &name, T *value) : name(name), value(value) {
    }
};

template<typename... Fields>
struct Reflectable {
    std::string           name;
    std::tuple<Fields...> fields;

    Reflectable(const std::string &name, std::tuple<Fields...> fields) : name(name), fields(fields) {
    }
};

template<typename T>
concept IsReflectable = requires(T type) {
    Reflect(type);
};

// Example:
struct Transform {
    Vector3f   position;
    Quaternion rotation;
    Vector3f   scale;
};

inline auto Reflect(Transform &transform) {
    return Reflectable{
        "Transform",
        std::make_tuple(
            Field("position", &transform.position),
            Field("rotation", &transform.rotation),
            Field("scale", &transform.scale)
        )
    };
}
```

I then serialize to JSON to get the final result:

```json
{
  "position": {
    "x": 2.0,
    "y": 1.0,
    "z": 3.0
  },
  "rotation": {
    "x": 0.0,
    "y": 0.0,
    "z": 0.0,
    "w": 1.0
  },
  "scale": {
    "x": 1.0,
    "y": 1.0,
    "z": 1.0
  }
}
```

Deserialization is the same but in reverse.

And this week, I've finished basic physics simulation using the
[ReactPhysics3D](https://github.com/DanielChappuis/reactphysics3d) library.
I only implemented box and sphere colliders, but more types will come soon.

Stay tuned for updates and see you later!