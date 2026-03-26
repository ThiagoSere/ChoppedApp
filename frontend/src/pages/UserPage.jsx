// idea para UsersPage.jsx (resumen)
useEffect(() => {
  listUsers().then(setUsers).catch(handleError);
}, []);

const onCreate = async (form) => {
  const created = await createUser(form); // name, email, password
  setUsers((prev) => [created, ...prev]);
};

const onUpdate = async (id, form) => {
  const updated = await updateUser(id, form); // name/email/password opcional
  setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
};

const onDelete = async (id) => {
  await deleteUser(id);
  setUsers((prev) => prev.filter((u) => u.id !== id));
};
