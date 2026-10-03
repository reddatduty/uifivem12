local nuiOpen = false

local function setNui(open)
    nuiOpen = open
    SetNuiFocus(open, open)
    SendNUIMessage({ action = open and 'open' or 'close' })
end

RegisterCommand('tuningui', function()
    setNui(not nuiOpen)
end, false)

RegisterNUICallback('close', function(_, cb)
    setNui(false)
    cb({ ok = true })
end)

RegisterNUICallback('previewMod', function(data, cb)
    -- Apply a temporary GTA vehicle mod here.
    -- Keep original vehicle state server/client-side so resetPreview can restore it.
    cb({ ok = true })
end)

RegisterNUICallback('previewPaint', function(data, cb)
    -- data.finish, data.color, data.name
    -- Convert CSS/hex color to the GTA color logic used by your resource.
    cb({ ok = true })
end)

RegisterNUICallback('previewEffect', function(data, cb)
    -- data.category is neon, headlights, or smoke.
    -- data.color can be a hex value or "rainbow".
    cb({ ok = true })
end)

RegisterNUICallback('previewEngineSound', function(data, cb)
    -- data.soundId is the server-defined GTA-style audio profile identifier.
    cb({ ok = true })
end)

RegisterNUICallback('removePreview', function(data, cb)
    -- Restore the previous value for data.key.
    cb({ ok = true })
end)

RegisterNUICallback('rotatePreview', function(data, cb)
    -- Optional: rotate the preview vehicle/camera from data.delta.
    -- Optional zoom signal is data.zoom (-1 / 1).
    cb({ ok = true })
end)

RegisterNUICallback('resetPreview', function(_, cb)
    -- Restore every previewed vehicle property to the pre-menu snapshot.
    cb({ ok = true })
end)

RegisterNUICallback('purchase', function(data, cb)
    -- IMPORTANT: validate every item and price server-side before charging.
    -- Never trust totals sent by the browser.
    -- data.items contains the queued build; data.totals is display-only.
    cb({ ok = true })
end)

-- Example opener. Replace these values with your framework/server data.
RegisterNetEvent('vanta_tuning:open', function(payload)
    nuiOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        wallet = payload and payload.wallet or {
            bank = 42800000,
            cash = 8400000,
            diamonds = 2840,
            lei = 1250
        },
        vehicle = payload and payload.vehicle or {
            name = 'PROGEN EMERUS',
            plate = 'VANTA 01',
            baseTopSpeed = 312,
            power = 812,
            torque = 786
        },
        capabilities = payload and payload.capabilities or nil
    })
end)

CreateThread(function()
    while true do
        if nuiOpen then
            DisableControlAction(0, 1, true)
            DisableControlAction(0, 2, true)
            DisableControlAction(0, 24, true)
            DisableControlAction(0, 25, true)
            DisableControlAction(0, 200, true)
            Wait(0)
        else
            Wait(500)
        end
    end
end)
