-- Delete unwanted halls
DELETE FROM halls WHERE id IN (
  '0d210aa4-bd54-4519-bb45-4f93d5392c1c',  -- Executive Boardroom
  '6f84a4ce-a906-42e8-a815-6524d52f4168'   -- Mini Conference Room B
);

-- Rename Mini Conference Room A to Mini Conference Hall
UPDATE halls 
SET name = 'Mini Conference Hall' 
WHERE id = '8a6844d0-f80f-404e-949e-442f528fb4ba';