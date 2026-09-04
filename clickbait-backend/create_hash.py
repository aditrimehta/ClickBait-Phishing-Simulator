from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

password = input("Enter admin password: ")

hashed = password_hash.hash(password)

print("\nPassword hash:")
print(hashed)