local nuiOpen = false
local currentVehicle = 0
local snapshot = nil
local rainbowEffect = nil

local BODY_SLOTS = {
    spoilers = 0, frontBumper = 1, rearBumper = 2, sideSkirt = 3, exhaust = 4,
    frame = 5, grille = 6, hood = 7, fender = 8, rightFender = 9, roof = 10,
    horn = 14, plateHolder = 25, vanityPlate = 26, trimA = 27, ornaments = 28,
    dashboard = 29, dials = 30, doorSpeakers = 31, seats = 32, steeringWheel = 33,
    shiftLever = 34, plaques = 35, speakers = 36, trunk = 37, hydraulics = 38,
    engineBlock = 39, airFilter = 40, struts = 41, archCover = 42, aerials = 43,
    trimB = 44, tank = 45, doorLeft = 46, doorRight = 47
}

local WHEEL_TYPES = {
    ['Sport'] = 0, ['Muscle'] = 1, ['Lowrider'] = 2, ['SUV'] = 3, ['Offroad'] = 4,
    ['Tuner'] = 5, ['Bike'] = 6, ['High End'] = 7, ["Benny's Original"] = 8,
    ["Benny's Bespoke"] = 9, ['Open Wheel'] = 10, ['Street'] = 11, ['Track'] = 12
}

local function labelForMod(vehicle, modType, modIndex, fallback)
    local key = GetModTextLabel(vehicle, modType, modIndex)
    if key and key ~= '' then
        local text = GetLabelText(key)
        if text and text ~= 'NULL' and text ~= '' then return text end
    end
    return fallback
end

local function hexToRgb(hex)
    if type(hex) ~= 'string' then return 85, 245, 138 end
    hex = hex:gsub('#', '')
    if #hex ~= 6 then return 85, 245, 138 end
    return tonumber(hex:sub(1,2),16) or 85, tonumber(hex:sub(3,4),16) or 245, tonumber(hex:sub(5,6),16) or 138
end

local function captureSnapshot(vehicle)
    SetVehicleModKit(vehicle, 0)
    local mods = {}
    for modType = 0, 49 do mods[modType] = GetVehicleMod(vehicle, modType) end
    local primary, secondary = GetVehicleColours(vehicle)
    local pearl, wheelColor = GetVehicleExtraColours(vehicle)
    local pr, pg, pb = GetVehicleCustomPrimaryColour(vehicle)
    local sr, sg, sb = GetVehicleCustomSecondaryColour(vehicle)
    local nr, ng, nb = GetVehicleNeonLightsColour(vehicle)
    local tr, tg, tb = GetVehicleTyreSmokeColor(vehicle)
    local neonEnabled = {}
    for i = 0, 3 do neonEnabled[i] = IsVehicleNeonLightEnabled(vehicle, i) end

    return {
        mods = mods,
        wheelType = GetVehicleWheelType(vehicle),
        primary = primary, secondary = secondary, pearl = pearl, wheelColor = wheelColor,
        primaryCustom = GetIsVehiclePrimaryColourCustom(vehicle),
        secondaryCustom = GetIsVehicleSecondaryColourCustom(vehicle),
        primaryRgb = {pr,pg,pb}, secondaryRgb = {sr,sg,sb},
        neonRgb = {nr,ng,nb}, neonEnabled = neonEnabled,
        smokeRgb = {tr,tg,tb},
        xenon = IsToggleModOn(vehicle, 22),
        tyreSmoke = IsToggleModOn(vehicle, 20),
        turbo = IsToggleModOn(vehicle, 18),
        livery = GetVehicleLivery(vehicle),
        windowTint = GetVehicleWindowTint(vehicle),
        maxVel = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fInitialDriveMaxFlatVel'),
        estimatedMax = GetVehicleEstimatedMaxSpeed(vehicle),
        audioName = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle))
    }
end

local function restoreSnapshot(vehicle)
    if not snapshot or vehicle == 0 then return end
    rainbowEffect = nil
    SetVehicleModKit(vehicle, 0)
    for modType = 0, 49 do
        if modType ~= 17 and modType ~= 18 and modType ~= 20 and modType ~= 22 then
            SetVehicleMod(vehicle, modType, snapshot.mods[modType] or -1, false)
        end
    end
    SetVehicleWheelType(vehicle, snapshot.wheelType or 0)
    SetVehicleColours(vehicle, snapshot.primary or 0, snapshot.secondary or 0)
    SetVehicleExtraColours(vehicle, snapshot.pearl or 0, snapshot.wheelColor or 0)
    if snapshot.primaryCustom then
        SetVehicleCustomPrimaryColour(vehicle, snapshot.primaryRgb[1], snapshot.primaryRgb[2], snapshot.primaryRgb[3])
    else
        ClearVehicleCustomPrimaryColour(vehicle)
    end
    if snapshot.secondaryCustom then
        SetVehicleCustomSecondaryColour(vehicle, snapshot.secondaryRgb[1], snapshot.secondaryRgb[2], snapshot.secondaryRgb[3])
    else
        ClearVehicleCustomSecondaryColour(vehicle)
    end
    for i = 0, 3 do SetVehicleNeonLightEnabled(vehicle, i, snapshot.neonEnabled[i] == true) end
    SetVehicleNeonLightsColour(vehicle, snapshot.neonRgb[1], snapshot.neonRgb[2], snapshot.neonRgb[3])
    ToggleVehicleMod(vehicle, 20, snapshot.tyreSmoke == true)
    SetVehicleTyreSmokeColor(vehicle, snapshot.smokeRgb[1], snapshot.smokeRgb[2], snapshot.smokeRgb[3])
    ToggleVehicleMod(vehicle, 22, snapshot.xenon == true)
    ToggleVehicleMod(vehicle, 18, snapshot.turbo == true)
    SetVehicleLivery(vehicle, snapshot.livery or -1)
    SetVehicleWindowTint(vehicle, snapshot.windowTint or 0)
    SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fInitialDriveMaxFlatVel', snapshot.maxVel)
    SetVehicleMaxSpeed(vehicle, snapshot.estimatedMax)
    pcall(function() ForceVehicleEngineAudio(vehicle, snapshot.audioName) end)
end

local function buildBodyCapabilities(vehicle)
    local body, bodyOptions = {}, {}
    for id, modType in pairs(BODY_SLOTS) do
        local count = GetNumVehicleMods(vehicle, modType)
        body[id] = count > 0
        if count > 0 then
            bodyOptions[id] = {}
            for modIndex = 0, count - 1 do
                bodyOptions[id][#bodyOptions[id] + 1] = {
                    modType = modType,
                    modIndex = modIndex,
                    name = labelForMod(vehicle, modType, modIndex, ('Option %02d'):format(modIndex + 1))
                }
            end
        end
    end
    return body, bodyOptions
end

local function buildLiveries(vehicle)
    local options = {}
    local modCount = GetNumVehicleMods(vehicle, 48)
    if modCount > 0 then
        for i = 0, modCount - 1 do
            options[#options + 1] = {
                index = i, type = 'mod',
                name = labelForMod(vehicle, 48, i, ('Livery %02d'):format(i + 1))
            }
        end
        return true, options
    end

    local textureCount = GetVehicleLiveryCount(vehicle)
    if textureCount and textureCount > 0 then
        for i = 0, textureCount - 1 do
            local key = GetLiveryName(vehicle, i)
            local name = key and GetLabelText(key) or nil
            if not name or name == 'NULL' or name == '' then name = ('Livery %02d'):format(i + 1) end
            options[#options + 1] = { index = i, type = 'native', name = name }
        end
        return true, options
    end
    return false, options
end

local function buildWheelOptions(vehicle)
    local originalType = GetVehicleWheelType(vehicle)
    local originalWheel = GetVehicleMod(vehicle, 23)
    local result = {}
    for family, wheelType in pairs(WHEEL_TYPES) do
        SetVehicleWheelType(vehicle, wheelType)
        local count = GetNumVehicleMods(vehicle, 23)
        if count > 0 then
            result[family] = {}
            for i = 0, count - 1 do
                result[family][#result[family] + 1] = {
                    index = i, wheelType = wheelType,
                    name = labelForMod(vehicle, 23, i, ('%s %02d'):format(family, i + 1))
                }
            end
        end
    end
    SetVehicleWheelType(vehicle, originalType)
    SetVehicleMod(vehicle, 23, originalWheel, false)
    return result
end

local function buildPayload(vehicle)
    SetVehicleModKit(vehicle, 0)
    local body, bodyOptions = buildBodyCapabilities(vehicle)
    local hasLivery, liveryOptions = buildLiveries(vehicle)
    local model = GetEntityModel(vehicle)
    local display = GetDisplayNameFromVehicleModel(model)
    local vehicleName = GetLabelText(display)
    if not vehicleName or vehicleName == 'NULL' then vehicleName = display end

    return {
        wallet = { bank = 42800000, cash = 8400000, diamonds = 2840, lei = 1250 },
        vehicle = {
            name = vehicleName,
            plate = GetVehicleNumberPlateText(vehicle),
            baseTopSpeed = math.floor(GetVehicleEstimatedMaxSpeed(vehicle) * 3.6 + 0.5),
            power = math.floor(GetVehicleModelAcceleration(model) * 1000 + 0.5),
            torque = math.floor(GetVehicleMaxTraction(vehicle) * 250 + 0.5)
        },
        capabilities = {
            body = body,
            bodyOptions = bodyOptions,
            livery = hasLivery,
            liveryCount = #liveryOptions,
            liveryOptions = liveryOptions,
            neon = true,
            headlights = true,
            smoke = true,
            wheels = true,
            wheelOptions = buildWheelOptions(vehicle)
        }
    }
end

local function setNui(open, payload)
    nuiOpen = open
    SetNuiFocus(open, open)
    SetNuiFocusKeepInput(false)
    if open then
        SendNUIMessage({
            action = 'open',
            wallet = payload.wallet,
            vehicle = payload.vehicle,
            capabilities = payload.capabilities
        })
    else
        SendNUIMessage({ action = 'close' })
    end
end

local function openForVehicle(vehicle, payloadOverride)
    if vehicle == 0 or not DoesEntityExist(vehicle) then return false end
    currentVehicle = vehicle
    snapshot = captureSnapshot(vehicle)
    local payload = payloadOverride or buildPayload(vehicle)
    setNui(true, payload)
    FreezeEntityPosition(vehicle, true)
    return true
end

RegisterCommand('tuningui', function()
    if nuiOpen then
        restoreSnapshot(currentVehicle)
        if currentVehicle ~= 0 then FreezeEntityPosition(currentVehicle, false) end
        setNui(false)
        return
    end
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle == 0 then return end
    openForVehicle(vehicle)
end, false)

RegisterNUICallback('close', function(_, cb)
    restoreSnapshot(currentVehicle)
    if currentVehicle ~= 0 then FreezeEntityPosition(currentVehicle, false) end
    setNui(false)
    cb({ ok = true })
end)

RegisterNUICallback('previewMod', function(data, cb)
    local vehicle = currentVehicle
    if vehicle == 0 then cb({ok=false}); return end
    SetVehicleModKit(vehicle, 0)

    if data.category == 'body' and data.modType ~= nil then
        SetVehicleMod(vehicle, tonumber(data.modType), tonumber(data.modIndex) or -1, false)
    elseif data.category == 'suspension' then
        SetVehicleMod(vehicle, 15, tonumber(data.modIndex) or -1, false)
    elseif data.category == 'armor' then
        SetVehicleMod(vehicle, 16, tonumber(data.modIndex) or -1, false)
    elseif data.category == 'wheels' then
        if data.wheelType ~= nil then SetVehicleWheelType(vehicle, tonumber(data.wheelType)) end
        SetVehicleMod(vehicle, 23, tonumber(data.wheelIndex) or -1, false)
    elseif data.category == 'livery' then
        if data.liveryType == 'native' then
            SetVehicleMod(vehicle, 48, -1, false)
            SetVehicleLivery(vehicle, tonumber(data.liveryIndex) or -1)
        else
            SetVehicleMod(vehicle, 48, tonumber(data.liveryIndex) or -1, false)
        end
    elseif data.category == 'engine' then
        local stage = math.max(0, math.min(4, tonumber(data.stage) or 0))
        local multiplier = 1.0 + (0.15 * stage)
        if data.turbo == true then multiplier = multiplier * 1.30 end
        SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fInitialDriveMaxFlatVel', snapshot.maxVel * multiplier)
        SetVehicleMaxSpeed(vehicle, snapshot.estimatedMax * multiplier)
        ToggleVehicleMod(vehicle, 18, data.turbo == true or snapshot.turbo == true)
    end
    cb({ ok = true })
end)

RegisterNUICallback('previewPaint', function(data, cb)
    if currentVehicle == 0 then cb({ok=false}); return end
    local r,g,b = hexToRgb(data.color)
    SetVehicleCustomPrimaryColour(currentVehicle, r,g,b)
    cb({ ok = true })
end)

RegisterNUICallback('previewEffect', function(data, cb)
    local vehicle = currentVehicle
    if vehicle == 0 then cb({ok=false}); return end
    rainbowEffect = nil

    if data.color == 'rainbow' then
        rainbowEffect = data.category
        if data.category == 'neon' then for i=0,3 do SetVehicleNeonLightEnabled(vehicle,i,true) end end
        if data.category == 'headlights' then ToggleVehicleMod(vehicle,22,true); SetVehicleLights(vehicle,2) end
        if data.category == 'smoke' then ToggleVehicleMod(vehicle,20,true) end
        cb({ok=true}); return
    end

    local r,g,b = hexToRgb(data.color)
    if data.category == 'neon' then
        for i=0,3 do SetVehicleNeonLightEnabled(vehicle,i,true) end
        SetVehicleNeonLightsColour(vehicle,r,g,b)
    elseif data.category == 'headlights' then
        ToggleVehicleMod(vehicle,22,true)
        SetVehicleXenonLightsCustomColor(vehicle,r,g,b)
        SetVehicleLights(vehicle,2)
    elseif data.category == 'smoke' then
        ToggleVehicleMod(vehicle,20,true)
        SetVehicleTyreSmokeColor(vehicle,r,g,b)
    end
    cb({ ok = true })
end)

RegisterNUICallback('previewEngineSound', function(data, cb)
    if currentVehicle == 0 then cb({ok=false}); return end
    pcall(function() ForceVehicleEngineAudio(currentVehicle, tostring(data.soundId or '')) end)
    cb({ ok = true })
end)

RegisterNUICallback('removePreview', function(data, cb)
    if currentVehicle == 0 or not snapshot then cb({ok=false}); return end
    local key = tostring(data.key or '')
    local category = key:match('^([^:]+)')
    if category == 'body' then
        local bodyId = key:match('^body:([^:]+)')
        local modType = bodyId and BODY_SLOTS[bodyId]
        if modType then SetVehicleMod(currentVehicle,modType,snapshot.mods[modType] or -1,false) end
    elseif category == 'wheels' then
        SetVehicleWheelType(currentVehicle,snapshot.wheelType)
        SetVehicleMod(currentVehicle,23,snapshot.mods[23] or -1,false)
    elseif category == 'engine' then
        SetVehicleHandlingFloat(currentVehicle,'CHandlingData','fInitialDriveMaxFlatVel',snapshot.maxVel)
        SetVehicleMaxSpeed(currentVehicle,snapshot.estimatedMax)
        ToggleVehicleMod(currentVehicle,18,snapshot.turbo == true)
    elseif category == 'paint' then
        SetVehicleColours(currentVehicle,snapshot.primary,snapshot.secondary)
        if snapshot.primaryCustom then SetVehicleCustomPrimaryColour(currentVehicle,snapshot.primaryRgb[1],snapshot.primaryRgb[2],snapshot.primaryRgb[3]) else ClearVehicleCustomPrimaryColour(currentVehicle) end
    elseif category == 'neon' or category == 'headlights' or category == 'smoke' then
        rainbowEffect=nil
        for i=0,3 do SetVehicleNeonLightEnabled(currentVehicle,i,snapshot.neonEnabled[i] == true) end
        SetVehicleNeonLightsColour(currentVehicle,snapshot.neonRgb[1],snapshot.neonRgb[2],snapshot.neonRgb[3])
        ToggleVehicleMod(currentVehicle,20,snapshot.tyreSmoke == true)
        SetVehicleTyreSmokeColor(currentVehicle,snapshot.smokeRgb[1],snapshot.smokeRgb[2],snapshot.smokeRgb[3])
        ToggleVehicleMod(currentVehicle,22,snapshot.xenon == true)
    elseif category == 'sounds' then
        pcall(function() ForceVehicleEngineAudio(currentVehicle,snapshot.audioName) end)
    elseif category == 'suspension' then
        SetVehicleMod(currentVehicle,15,snapshot.mods[15] or -1,false)
    elseif category == 'armor' then
        SetVehicleMod(currentVehicle,16,snapshot.mods[16] or -1,false)
    end
    cb({ ok = true })
end)

RegisterNUICallback('rotatePreview', function(data, cb)
    if currentVehicle ~= 0 then
        if data.delta then
            SetEntityHeading(currentVehicle, GetEntityHeading(currentVehicle) - (tonumber(data.delta) or 0) * 0.18)
        end
    end
    cb({ ok = true })
end)

RegisterNUICallback('resetPreview', function(_, cb)
    restoreSnapshot(currentVehicle)
    cb({ ok = true })
end)

RegisterNUICallback('purchase', function(data, cb)
    -- UI work is complete here; connect this event to your economy/server persistence.
    -- The server must re-price and validate items instead of trusting browser totals.
    TriggerServerEvent('vanta_tuning:purchase', data.items or {})
    cb({ ok = true, pending = true })
end)

RegisterNetEvent('vanta_tuning:open', function(payload)
    local vehicle = GetVehiclePedIsIn(PlayerPedId(), false)
    if vehicle == 0 then return end
    openForVehicle(vehicle, payload)
end)

RegisterNetEvent('vanta_tuning:purchaseResult', function(success, message, wallet)
    SendNUIMessage({ action='purchaseResult', success=success, message=message })
    if wallet then SendNUIMessage({ action='setWallet', wallet=wallet }) end
    if success then
        snapshot = captureSnapshot(currentVehicle)
    end
end)

CreateThread(function()
    local hue = 0
    while true do
        if nuiOpen and rainbowEffect and currentVehicle ~= 0 then
            hue = (hue + 3) % 360
            local x = 1 - math.abs((hue / 60) % 2 - 1)
            local r,g,b = 0,0,0
            if hue < 60 then r,g=1,x elseif hue < 120 then r,g=x,1 elseif hue < 180 then g,b=1,x elseif hue < 240 then g,b=x,1 elseif hue < 300 then r,b=x,1 else r,b=1,x end
            r,g,b=math.floor(r*255),math.floor(g*255),math.floor(b*255)
            if rainbowEffect == 'neon' then
                SetVehicleNeonLightsColour(currentVehicle,r,g,b)
            elseif rainbowEffect == 'headlights' then
                SetVehicleXenonLightsCustomColor(currentVehicle,r,g,b)
            elseif rainbowEffect == 'smoke' then
                SetVehicleTyreSmokeColor(currentVehicle,r,g,b)
            end
            Wait(45)
        else
            Wait(250)
        end
    end
end)

CreateThread(function()
    while true do
        if nuiOpen then
            DisableControlAction(0,1,true)
            DisableControlAction(0,2,true)
            DisableControlAction(0,24,true)
            DisableControlAction(0,25,true)
            DisableControlAction(0,75,true)
            DisableControlAction(0,200,true)
            Wait(0)
        else
            Wait(500)
        end
    end
end)
