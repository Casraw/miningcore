INC_DIRS = -I. -Icontrib/epee/include
CFLAGS = $(CPU_FLAGS) $(INC_DIRS) -fno-exceptions -std=gnu11 -march=native -fPIC -DNDEBUG -Ofast -funroll-loops -fvariable-expansion-in-unroller -ftree-loop-if-convert-stores -fmerge-all-constants -fbranch-target-load-optimize2
CXXFLAGS = $(CPU_FLAGS) $(INC_DIRS) -fexceptions -frtti -std=gnu++17 -march=native -fPIC -DNDEBUG -Ofast -s -funroll-loops -fvariable-expansion-in-unroller -ftree-loop-if-convert-stores -fmerge-all-constants -fbranch-target-load-optimize2
LDFLAGS = -shared

# Boost.System has been header-only since Boost 1.69 and Boost >= 1.90 (Ubuntu
# 26.04) no longer ships a compiled libboost_system at all. Probe for it so the
# same Makefile keeps working on distros that still provide it.
BOOST_SYSTEM_LIB := $(shell echo 'int main(){return 0;}' | $(CXX) -xc++ - -lboost_system -o /dev/null > /dev/null 2>&1 && echo -lboost_system)

LDLIBS = $(BOOST_SYSTEM_LIB) -lboost_date_time
TARGET  = libcryptonote.so

OBJECTS = exports.o \
	cryptonote_core/cryptonote_format_utils.o \
	offshore/pricing_record.o \
	crypto/tree-hash.o \
	crypto/crypto.o \
	crypto/crypto-ops.o \
	crypto/crypto-ops-data.o \
	crypto/hash.o \
	crypto/keccak.o \
	common/base58.o \
        salvium_oracle/pricing_record.o \
        zephyr_oracle/pricing_record.o

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CXX) $(CXXFLAGS) $(CPPFLAGS) $(LDFLAGS) -o $@ $^ $(LDLIBS)

.PHONY: clean

clean:
	$(RM) $(TARGET) $(OBJECTS)
