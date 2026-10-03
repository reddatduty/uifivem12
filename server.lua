local function fail(src, message)
    TriggerClientEvent('vanta_tuning:purchaseResult', src, false, message or 'Purchase rejected.')
end

local paintCash = {
    normal = {125000,125000,125000,145000,145000,145000,160000,160000,175000,175000,175000,175000},
    matte = {240000,240000,260000,275000,275000,275000,295000,295000,320000},
    metallic = {380000,380000,420000,420000,450000,450000,480000,480000,520000}
}
local paintDiamonds = {
    chrome = {85,95,110,120,120,120},
    chameleon = {160,175,180,190,200,240}
}
local enginePrices = {
    stage0={diamonds=0,lei=0}, stage1={diamonds=110,lei=0}, stage2={diamonds=225,lei=0},
    stage3={diamonds=390,lei=0}, stage4={diamonds=620,lei=0}, stage4turbo={diamonds=850,lei=400}
}
local suspensionPrices = {0,450000,850000,1600000,2400000}
local armorPrices = {0,900000,1800000,3200000,5200000,8500000}

local function emptyPrice() return {cash=0,diamonds=0,lei=0} end

local function authoritativePrice(key)
    if type(key) ~= 'string' or #key > 96 then return nil end
    local p = emptyPrice()

    local finish, index = key:match('^paint:([^:]+):(%d+)$')
    if finish and index then
        index = tonumber(index) + 1
        if paintCash[finish] and paintCash[finish][index] then p.cash=paintCash[finish][index]; return p end
        if paintDiamonds[finish] and paintDiamonds[finish][index] then p.diamonds=paintDiamonds[finish][index]; return p end
        return nil
    end
    finish = key:match('^paint:custom:([^:]+)$')
    if finish then
        if finish=='normal' or finish=='matte' or finish=='metallic' then p.cash=650000; return p end
        if finish=='chrome' or finish=='chameleon' then p.diamonds=260; return p end
        return nil
    end

    local engine = key:match('^engine:([^:]+)$')
    if engine and enginePrices[engine] then
        p.diamonds=enginePrices[engine].diamonds
        p.lei=enginePrices[engine].lei
        return p
    end

    local suspension = tonumber(key:match('^suspension:(%d+)$'))
    if suspension and suspensionPrices[suspension+1] then p.cash=suspensionPrices[suspension+1]; return p end

    local armor = tonumber(key:match('^armor:(%d+)$'))
    if armor and armorPrices[armor+1] then p.cash=armorPrices[armor+1]; return p end

    local bodyId, bodyIndex = key:match('^body:([^:]+):([^:]+)$')
    if bodyId and bodyIndex then
        if bodyIndex=='stock' then return p end
        bodyIndex=tonumber(bodyIndex)
        if not bodyIndex or bodyIndex < 0 or bodyIndex > 200 then return nil end
        p.cash=math.min(7500000,650000+bodyIndex*175000)
        return p
    end

    if key=='livery:stock' then return p end
    local livery=tonumber(key:match('^livery:(%d+)$'))
    if livery and livery >= 0 and livery <= 200 then p.diamonds=35+livery*8; return p end

    local effect, effectIndex = key:match('^(neon):(%d+)$')
    if not effect then effect,effectIndex=key:match('^(headlights):(%d+)$') end
    if not effect then effect,effectIndex=key:match('^(smoke):(%d+)$') end
    if effect and effectIndex then
        effectIndex=tonumber(effectIndex)
        local base=effect=='headlights' and 28 or 34
        p.diamonds=base+math.floor(effectIndex/4)*3
        return p
    end
    effect=key:match('^(neon):custom$') or key:match('^(headlights):custom$') or key:match('^(smoke):custom$')
    if effect then p.diamonds=95; return p end
    effect=key:match('^(neon):rainbow$') or key:match('^(headlights):rainbow$') or key:match('^(smoke):rainbow$')
    if effect then p.diamonds=effect=='headlights' and 220 or 260; return p end

    local sound=tonumber(key:match('^sounds:(%d+)$'))
    if sound and sound >= 0 and sound <= 29 then
        local raw=12000000+((sound/29)^1.72)*488000000
        p.cash=math.floor(raw/1000000+0.5)*1000000
        return p
    end

    local family,wheelIndex=key:match('^wheels:([^:]+):(%d+)$')
    if family and wheelIndex then
        wheelIndex=tonumber(wheelIndex)
        if wheelIndex < 0 or wheelIndex > 250 then return nil end
        local premium = family=='High End' or family=='Track' or family=='Open Wheel' or family=="Benny's" or family=="Benny's Original" or family=="Benny's Bespoke"
        if premium then p.diamonds=55+wheelIndex*9 else p.cash=850000+wheelIndex*120000 end
        return p
    end
    return nil
end

local function priceBuild(items)
    if type(items) ~= 'table' or #items < 1 or #items > 64 then return nil, 'Invalid build size.' end
    local totals={cash=0,diamonds=0,lei=0}
    local normalized={}
    local unique={}
    for _,item in ipairs(items) do
        if type(item) ~= 'table' or type(item.key) ~= 'string' then return nil,'Invalid modification payload.' end
        if unique[item.key] then return nil,'Duplicate modification detected.' end
        unique[item.key]=true
        local price=authoritativePrice(item.key)
        if not price then return nil,'Unknown modification: '..item.key end
        totals.cash=totals.cash+price.cash
        totals.diamonds=totals.diamonds+price.diamonds
        totals.lei=totals.lei+price.lei
        normalized[#normalized+1]={key=item.key,category=item.category,price=price}
    end
    return {totals=totals,items=normalized}
end

-- Economy adapter contract:
-- AddEventHandler('vanta_tuning:charge', function(source, totals, done)
--   -- Validate/deduct cash, diamonds and lei using your framework.
--   -- done(true, {bank=...,cash=...,diamonds=...,lei=...}) on success.
--   -- done(false) on failure.
-- end)
--
-- Persistence adapter contract:
-- AddEventHandler('vanta_tuning:persist', function(source, normalizedItems) ... end)

RegisterNetEvent('vanta_tuning:purchase', function(items)
    local src=source
    local build,err=priceBuild(items)
    if not build then fail(src,err); return end

    local completed=false
    local function done(ok,wallet,message)
        if completed then return end
        completed=true
        if not ok then
            fail(src,message or 'Not enough currency or economy adapter rejected the purchase.')
            return
        end
        TriggerEvent('vanta_tuning:persist',src,build.items)
        TriggerClientEvent('vanta_tuning:purchaseResult',src,true,message or 'Build purchased successfully.',wallet)
    end

    TriggerEvent('vanta_tuning:charge',src,build.totals,done)

    SetTimeout(5000,function()
        if not completed then
            done(false,nil,'No economy adapter answered vanta_tuning:charge.')
        end
    end)
end)

exports('GetAuthoritativePrice',authoritativePrice)
exports('PriceBuild',priceBuild)
